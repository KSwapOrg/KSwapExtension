// Import will be handled globally in the extension context
// const KeetaNet = window.KeetaNetSDK;

/**
 * Keeta Wallet Client - Core wallet functionality for Chrome extension
 * Extracted and adapted from K-Swap DEX client
 */
export class KeetaWalletClient {
  private client: KeetaNet.UserClient;
  private signer: any; // KeetaNet.lib.Account
  private network: NetworkConfig;
  private seed: string;

  private constructor(
    client: KeetaNet.UserClient,
    signer: any,
    network: NetworkConfig,
    seed: string
  ) {
    this.client = client;
    this.signer = signer;
    this.network = network;
    this.seed = seed;
  }

  /**
   * Initialize wallet client with network and seed
   */
  static async initialize(
    networkName: 'mainnet' | 'testnet',
    seed?: string
  ): Promise<KeetaWalletClient> {
    console.log('🚀 [WALLET] Initialize called', { networkName, hasSeed: !!seed });
    
    try {
      // Check if KeetaNet is available
      if (!KeetaNet || !KeetaNet.lib || !KeetaNet.lib.Account) {
        throw new Error('KeetaNet SDK not properly loaded');
      }

      // Generate or use provided seed
      const seedString = seed || KeetaNet.lib.Account.generateRandomSeed({ asString: true });
      console.log('🔑 [WALLET] Seed ready (length:', seedString.length, ')');
      
      // Create account from seed
      const signer = KeetaNet.lib.Account.fromSeed(seedString, 0);
      console.log('✅ [WALLET] Account created:', signer.publicKeyString);
      
      // Connect to network
      const keetaNetworkName = networkName === 'mainnet' ? 'main' : 'test';
      const client = KeetaNet.UserClient.fromNetwork(keetaNetworkName, signer);
      
      const network = NETWORK_CONFIGS[networkName];

      // Verify connection
      await client.chain();
      console.log('✅ [WALLET] Connected to network');
      
      return new KeetaWalletClient(client, signer, network, seedString);
    } catch (error) {
      console.error('❌ [WALLET] Initialize failed:', error);
      throw new KSwapError(
        KSwapErrorCode.NETWORK_ERROR,
        `Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.signer.publicKeyString.get();
  }

  /**
   * Get wallet seed (for backup/export)
   */
  getSeed(): string {
    return this.seed;
  }

  /**
   * Get current network
   */
  getNetwork(): NetworkConfig {
    return this.network;
  }

  /**
   * Get account info including balances
   */
  async getAccountInfo() {
    console.log('👛 [WALLET] Getting account info...');
    
    try {
      // Get base token (KTA) info
      const baseToken = this.client.baseToken;
      const balance = await this.client.balance(baseToken);
      
      return {
        address: this.getAddress(),
        baseToken: baseToken,
        balance: balance,
        network: this.network.name
      };
    } catch (error) {
      console.error('❌ [WALLET] Failed to get account info:', error);
      throw error;
    }
  }

  /**
   * Get token balance for a specific token
   */
  async getTokenBalance(tokenId: TokenId): Promise<bigint> {
    if (tokenId === 'KTA' || tokenId === this.client.baseToken) {
      return await this.client.balance(this.client.baseToken);
    }
    
    try {
      const tokenAccount = KeetaNet.lib.Account.fromPublicKeyString(tokenId);
      return await this.client.balance(tokenAccount);
    } catch (error) {
      console.log(`Token ${tokenId} not found or no balance`);
      return 0n;
    }
  }

  /**
   * Send tokens to another address
   */
  async sendTokens(
    toAddress: string, 
    amount: bigint, 
    tokenId: TokenId = 'KTA'
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      console.log('💸 [WALLET] Sending tokens...', { toAddress, amount, tokenId });
      
      const builder = this.client.initBuilder();
      const recipientAccount = KeetaNet.lib.Account.fromPublicKeyString(toAddress);
      
      if (tokenId === 'KTA' || tokenId === this.client.baseToken) {
        // Send KTA (base token)
        builder.send(recipientAccount, amount);
      } else {
        // Send custom token
        const tokenAccount = KeetaNet.lib.Account.fromPublicKeyString(tokenId);
        builder.send(recipientAccount, amount, tokenAccount);
      }
      
      await this.client.publishBuilder(builder);
      
      console.log('✅ [WALLET] Tokens sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [WALLET] Send failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get available tokens (discovered from blockchain)
   */
  async getAvailableTokens(): Promise<TokenInfo[]> {
    console.log('🪙 [WALLET] Discovering tokens...');
    
    const candidateTokens = [
      'keeta_aogptm4ueeu23bu7wp3qmjulaicqqrw7fxuir4nxgjczjnwz3kplf2lw7vyfo', // APPLE
      'keeta_ap23whwndh3pakgqgd7arjigxchdooybu6rkrjhpf67hcdsbnu4q7egv25qyu', // BANANA  
      'keeta_apokqzupqbz7bevtw3y2xv2td4qu2pufeiwddizjvu6bauwvf5kvvcfghxymm', // FORD
      'keeta_apc4lsjabfe4bqxpneu33bew3y72jjvwdhbyr5w4ftlxgc4jt7uz3fvvph4y2', // TESLA
      'keeta_amkywdbdlwwiaeluszhpktortoqdg5ltsoiww2hot2meua3nzxvjmvdudznss', // KSWAP
    ];

    const tokenInfos: TokenInfo[] = [
      // Always include KTA (base token)
      {
        id: 'KTA',
        symbol: 'KTA',
        name: 'Keeta',
        decimals: 9,
        balance: await this.getTokenBalance('KTA')
      }
    ];

    // Check each candidate token
    for (const tokenId of candidateTokens) {
      try {
        const tokenInfo = await this.getTokenInfo(tokenId);
        if (tokenInfo) {
          tokenInfos.push(tokenInfo);
        }
      } catch (error) {
        // Token doesn't exist or can't be accessed, skip it
        continue;
      }
    }

    return tokenInfos;
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId: TokenId): Promise<TokenInfo | null> {
    if (tokenId === 'KTA') {
      const balance = await this.client.balance(this.client.baseToken);
      return {
        id: 'KTA',
        symbol: 'KTA',
        name: 'Keeta',
        decimals: 9,
        balance: balance
      };
    }

    try {
      const tokenAccount = KeetaNet.lib.Account.fromPublicKeyString(tokenId);
      
      // Check if token exists
      const info = await this.client.info(tokenAccount);
      if (!info) return null;

      // Get balance
      const balance = await this.client.balance(tokenAccount);

      // Parse metadata if available
      let symbol = tokenId.substring(0, 8);
      let name = 'Unknown Token';
      
      if (info.metadata) {
        try {
          const metadataStr = Buffer.from(info.metadata, 'base64').toString('utf-8');
          const metadata = JSON.parse(metadataStr);
          symbol = metadata.symbol || symbol;
          name = metadata.name || name;
        } catch (e) {
          // Metadata parsing failed, use defaults
        }
      }

      return {
        id: tokenId,
        symbol: symbol,
        name: name,
        decimals: 9, // Default to 9 decimals
        balance: balance
      };
    } catch (error) {
      console.log(`Token ${tokenId} not found:`, error);
      return null;
    }
  }

  /**
   * Sign a transaction (for DApp integration)
   */
  async signTransaction(transaction: any): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // This would implement transaction signing for DApp requests
      console.log('✍️ [WALLET] Signing transaction...', transaction);
      
      // For now, return a placeholder
      return { success: true, signature: 'placeholder_signature' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signing failed' 
      };
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(networkName: 'mainnet' | 'testnet'): Promise<boolean> {
    try {
      console.log('🌐 [WALLET] Switching to network:', networkName);
      
      // Re-initialize with new network
      const newClient = await KeetaWalletClient.initialize(networkName, this.seed);
      
      // Update current instance
      this.client = newClient.client;
      this.network = newClient.network;
      
      console.log('✅ [WALLET] Network switched successfully');
      return true;
    } catch (error) {
      console.error('❌ [WALLET] Network switch failed:', error);
      return false;
    }
  }
}
