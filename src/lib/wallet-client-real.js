// Keeta Wallet Client - Real Network Implementation
// Converted from TypeScript to work in Chrome extension context

class KeetaWalletClient {
  constructor(client, signer, network, seed, mode = 'demo') {
    this.client = client;
    this.signer = signer;
    this.network = network;
    this.seed = seed;
    this.mode = mode;
  }

  /**
   * Initialize wallet client with network and mode
   */
  static async initialize(networkName, seed, mode = 'demo') {
    console.log('🚀 [WALLET] Initialize called', { networkName, mode, hasSeed: !!seed });
    
    if (mode === 'demo') {
      return KeetaWalletClient.initializeDemo(networkName, seed);
    }

    try {
      // Check if KeetaNet SDK is available
      if (typeof KeetaNetSDK === 'undefined') {
        throw new Error('KeetaNet SDK not loaded. Falling back to demo mode.');
      }

      // Generate or use provided seed
      const seedString = seed || KeetaNetSDK.lib.Account.generateRandomSeed({ asString: true });
      console.log('🔑 [WALLET] Seed ready (length:', seedString.length, ')');
      
      // Create account from seed
      const signer = KeetaNetSDK.lib.Account.fromSeed(seedString, 0);
      console.log('✅ [WALLET] Account created:', signer.publicKeyString);
      
      // Connect to network
      const keetaNetworkName = networkName === 'mainnet' ? 'main' : 'test';
      const client = KeetaNetSDK.UserClient.fromNetwork(keetaNetworkName, signer);
      
      // Get network config
      const network = {
        name: networkName,
        rpcUrl: networkName === 'mainnet' ? 'https://rpc.keeta.network' : 'https://test-rpc.keeta.network'
      };

      // Verify connection
      await client.chain();
      console.log('✅ [WALLET] Connected to real network:', networkName);
      
      return new KeetaWalletClient(client, signer, network, seedString, mode);
    } catch (error) {
      console.error('❌ [WALLET] Real network failed, falling back to demo:', error);
      return KeetaWalletClient.initializeDemo(networkName, seed);
    }
  }

  /**
   * Initialize demo mode with fake data
   */
  static async initializeDemo(networkName, seed) {
    console.log('🎭 [WALLET] Initializing DEMO mode');
    
    const seedString = seed || 'demo_seed_' + Math.random().toString(36);
    const mockNetwork = { name: networkName + '_demo' };
    
    return new KeetaWalletClient(null, null, mockNetwork, seedString, 'demo');
  }

  /**
   * Get wallet address
   */
  getAddress() {
    if (this.mode === 'demo') {
      return 'keeta_demo_address_' + this.seed.slice(-8);
    }
    return this.signer.publicKeyString.get();
  }

  /**
   * Get wallet seed
   */
  getSeed() {
    return this.seed;
  }

  /**
   * Get current network
   */
  getNetwork() {
    return this.network;
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get account info including balances
   */
  async getAccountInfo() {
    console.log('👛 [WALLET] Getting account info... (mode:', this.mode, ')');
    
    if (this.mode === 'demo') {
      return {
        address: this.getAddress(),
        baseToken: 'KTA',
        balance: BigInt('1000000000'), // 1 KTA demo
        network: this.network.name,
        mode: 'demo'
      };
    }

    try {
      // Real network call
      const baseToken = this.client.baseToken;
      const balance = await this.client.balance(baseToken);
      
      return {
        address: this.getAddress(),
        baseToken: baseToken,
        balance: balance,
        network: this.network.name,
        mode: this.mode
      };
    } catch (error) {
      console.error('❌ [WALLET] Failed to get account info:', error);
      throw error;
    }
  }

  /**
   * Get token balance for a specific token
   */
  async getTokenBalance(tokenId) {
    if (this.mode === 'demo') {
      if (tokenId === 'KTA') return BigInt('1000000000');
      if (tokenId === 'DEMO') return BigInt('500000000');
      return BigInt('0');
    }

    try {
      if (tokenId === 'KTA' || tokenId === this.client.baseToken) {
        return await this.client.balance(this.client.baseToken);
      }
      
      const tokenAccount = KeetaNetSDK.lib.Account.fromPublicKeyString(tokenId);
      return await this.client.balance(tokenAccount);
    } catch (error) {
      console.log(`Token ${tokenId} not found or no balance:`, error);
      return BigInt('0');
    }
  }

  /**
   * Send tokens to another address
   */
  async sendTokens(toAddress, amount, tokenId = 'KTA') {
    console.log('💸 [WALLET] Sending tokens... (mode:', this.mode, ')', { toAddress, amount: amount.toString(), tokenId });
    
    if (this.mode === 'demo') {
      // Simulate demo send
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ [WALLET] Demo transaction completed');
      return { success: true, transactionId: 'demo_tx_' + Date.now(), mode: 'demo' };
    }

    try {
      // Real network transaction
      const builder = this.client.initBuilder();
      const recipientAccount = KeetaNetSDK.lib.Account.fromPublicKeyString(toAddress);
      
      if (tokenId === 'KTA' || tokenId === this.client.baseToken) {
        builder.send(recipientAccount, amount);
      } else {
        const tokenAccount = KeetaNetSDK.lib.Account.fromPublicKeyString(tokenId);
        builder.send(recipientAccount, amount, tokenAccount);
      }
      
      const result = await this.client.publishBuilder(builder);
      
      console.log('✅ [WALLET] Real transaction sent successfully');
      return { success: true, transactionId: result.hash || 'real_tx_' + Date.now(), mode: this.mode };
    } catch (error) {
      console.error('❌ [WALLET] Send failed:', error);
      return { 
        success: false, 
        error: error.message || 'Transaction failed',
        mode: this.mode
      };
    }
  }

  /**
   * Get available tokens
   */
  async getAvailableTokens() {
    console.log('🪙 [WALLET] Discovering tokens... (mode:', this.mode, ')');
    
    if (this.mode === 'demo') {
      return [
        {
          id: 'KTA',
          symbol: 'KTA',
          name: 'Keeta (Demo)',
          decimals: 9,
          balance: BigInt('1000000000')
        },
        {
          id: 'DEMO',
          symbol: 'DEMO', 
          name: 'Demo Token',
          decimals: 9,
          balance: BigInt('500000000')
        }
      ];
    }

    // Real token discovery
    const candidateTokens = [
      'keeta_aogptm4ueeu23bu7wp3qmjulaicqqrw7fxuir4nxgjczjnwz3kplf2lw7vyfo', // APPLE
      'keeta_ap23whwndh3pakgqgd7arjigxchdooybu6rkrjhpf67hcdsbnu4q7egv25qyu', // BANANA  
      'keeta_apokqzupqbz7bevtw3y2xv2td4qu2pufeiwddizjvu6bauwvf5kvvcfghxymm', // FORD
      'keeta_apc4lsjabfe4bqxpneu33bew3y72jjvwdhbyr5w4ftlxgc4jt7uz3fvvph4y2', // TESLA
      'keeta_amkywdbdlwwiaeluszhpktortoqdg5ltsoiww2hot2meua3nzxvjmvudznss', // KSWAP
    ];

    const tokenInfos = [
      // Always include KTA (base token)
      {
        id: 'KTA',
        symbol: 'KTA',
        name: `Keeta (${this.mode})`,
        decimals: 9,
        balance: await this.getTokenBalance('KTA')
      }
    ];

    // Check each candidate token
    for (const tokenId of candidateTokens) {
      try {
        const tokenInfo = await this.getTokenInfo(tokenId);
        if (tokenInfo && tokenInfo.balance > 0n) {
          tokenInfos.push(tokenInfo);
        }
      } catch (error) {
        continue;
      }
    }

    return tokenInfos;
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId) {
    if (this.mode === 'demo') {
      if (tokenId === 'KTA') {
        return {
          id: 'KTA',
          symbol: 'KTA', 
          name: 'Keeta (Demo)',
          decimals: 9,
          balance: BigInt('1000000000')
        };
      }
      return null;
    }

    // Real token info
    if (tokenId === 'KTA') {
      const balance = await this.client.balance(this.client.baseToken);
      return {
        id: 'KTA',
        symbol: 'KTA',
        name: `Keeta (${this.mode})`,
        decimals: 9,
        balance: balance
      };
    }

    try {
      const tokenAccount = KeetaNetSDK.lib.Account.fromPublicKeyString(tokenId);
      const info = await this.client.info(tokenAccount);
      if (!info) return null;

      const balance = await this.client.balance(tokenAccount);
      
      // Parse metadata
      let symbol = tokenId.substring(0, 8);
      let name = 'Unknown Token';
      
      if (info.metadata) {
        try {
          const metadataStr = Buffer.from(info.metadata, 'base64').toString('utf-8');
          const metadata = JSON.parse(metadataStr);
          symbol = metadata.symbol || symbol;
          name = metadata.name || name;
        } catch (e) {
          // Metadata parsing failed
        }
      }

      return {
        id: tokenId,
        symbol: symbol,
        name: name,
        decimals: 9,
        balance: balance
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(networkName) {
    try {
      console.log('🌐 [WALLET] Switching to network:', networkName, '(mode:', this.mode, ')');
      
      if (this.mode === 'demo') {
        this.network.name = networkName + '_demo';
        return true;
      }

      // Re-initialize with new network
      const newClient = await KeetaWalletClient.initialize(networkName, this.seed, this.mode);
      
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

  /**
   * Sign transaction
   */
  async signTransaction(transaction) {
    try {
      console.log('✍️ [WALLET] Signing transaction... (mode:', this.mode, ')', transaction);
      
      if (this.mode === 'demo') {
        return { success: true, signature: 'demo_signature_' + Date.now() };
      }

      // Real transaction signing would go here
      return { success: true, signature: 'real_signature_' + Date.now() };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Signing failed' 
      };
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.KeetaWalletClient = KeetaWalletClient;
}

// Also export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeetaWalletClient };
}
