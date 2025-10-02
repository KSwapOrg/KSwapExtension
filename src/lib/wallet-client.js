// Keeta Wallet Client - Demo/Fallback Implementation
// Simple demo client for testing and fallback scenarios

class KeetaWalletClient {
  constructor(network, seed) {
    this.network = network;
    this.seed = seed;
    this.mode = 'demo';
    
    // Generate consistent demo address from seed
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    this.address = 'keeta_demo_' + Math.abs(hash).toString(36).padStart(8, '0');
    
    this.tokens = [];
  }

  /**
   * Initialize demo wallet client with network and seed
   */
  static async initialize(networkName, seed, mode = 'demo') {
    console.log('🚀 [WALLET] Demo Initialize called', { networkName, mode, hasSeed: !!seed });
    
    try {
      // Try to generate proper SDK seed even for demo if SDK available
      let seedString = seed;
      
      if (!seed) {
        try {
          const globalScope = (typeof window !== 'undefined') ? window : self;
          const KeetaNet = globalScope.KeetaNet;
          
          if (KeetaNet && KeetaNet.lib && KeetaNet.lib.Account) {
            // Use proper SDK seed generation
            seedString = KeetaNet.lib.Account.generateRandomSeed({ asString: true });
            console.log('🔑 [WALLET] Demo using proper SDK seed (length:', seedString.length, ')');
          } else {
            // Fallback to simple demo seed
            seedString = 'demo_seed_' + Math.random().toString(36);
            console.log('🔑 [WALLET] Demo using fallback seed (length:', seedString.length, ')');
          }
        } catch (error) {
          seedString = 'demo_seed_' + Math.random().toString(36);
          console.log('🔑 [WALLET] Demo using simple seed due to error:', error.message);
        }
      }
      
      console.log('✅ [WALLET] Demo connected to network:', networkName);
      
      const client = new KeetaWalletClient(networkName, seedString);
      
      // Initialize with some demo tokens
      await client.discoverTokens();
      
      return client;
    } catch (error) {
      console.error('❌ [WALLET] Demo Initialize failed:', error);
      throw new Error(`Failed to initialize demo wallet: ${error.message}`);
    }
  }

  /**
   * Get wallet address
   */
  getAddress() {
    return this.address;
  }

  /**
   * Get wallet seed (for backup/export)
   */
  getSeed() {
    return this.seed;
  }

  /**
   * Get current network
   */
  getNetwork() {
    return { name: this.network };
  }

  /**
   * Get account info including balances
   */
  async getAccountInfo() {
    console.log('👛 [WALLET] Getting demo account info...');
    
    return {
      address: this.getAddress(),
      network: this.network,
      balance: BigInt('1000000000000000'), // 1M KTA demo balance
      tokens: this.tokens
    };
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenId = 'KTA') {
    console.log('🪙 [WALLET] Getting demo token balance for:', tokenId);
    
    const demoBalances = {
      'KTA': BigInt('1000000000000000'), // 1M KTA
      'USDC': BigInt('5000000000'), // 5K USDC  
      'ETH': BigInt('2000000000000000000'), // 2 ETH
    };
    
    return demoBalances[tokenId] || BigInt('100000000000000'); // Default 100K
  }

  /**
   * Get available tokens (alias for discoverTokens for popup compatibility)
   */
  async getAvailableTokens() {
    return await this.discoverTokens();
  }

  /**
   * Discover available tokens
   */
  async discoverTokens() {
    console.log('🪙 [WALLET] Discovering demo tokens...');
    
    this.tokens = [
      { 
        id: 'KTA',
        symbol: 'KTA', 
        name: 'Keeta Token', 
        balance: await this.getTokenBalance('KTA'), 
        decimals: 9,
        logoUri: '/icons/kta-logo.png'
      },
      { 
        id: 'USDC',
        symbol: 'USDC', 
        name: 'USD Coin', 
        balance: await this.getTokenBalance('USDC'), 
        decimals: 6,
        logoUri: '/icons/usdc-logo.png'
      },
      { 
        id: 'ETH',
        symbol: 'ETH', 
        name: 'Ethereum', 
        balance: await this.getTokenBalance('ETH'), 
        decimals: 18,
        logoUri: '/icons/eth-logo.png'
      },
    ];
    
    return this.tokens;
  }

  /**
   * Send tokens (demo implementation)
   */
  async sendTokens(toAddress, amount, tokenId = 'KTA') {
    console.log('💸 [WALLET] Demo sending tokens:', {
      to: toAddress,
      amount: amount.toString(),
      token: tokenId
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: 'demo_tx_' + Date.now(),
      blockId: 'demo_block_' + Date.now()
    };
  }

  /**
   * Sign transaction (demo implementation)
   */
  async signTransaction(transaction) {
    console.log('✍️ [WALLET] Demo signing transaction:', transaction);
    
    // Simulate signing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      signature: 'demo_signature_' + Date.now()
    };
  }

  /**
   * Switch network (demo implementation)
   */
  async switchNetwork(networkName) {
    console.log('🔄 [WALLET] Demo switching network to:', networkName);
    
    this.network = networkName + '_demo';
    
    // Simulate network switch delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return true;
  }

  /**
   * Get transaction history (demo implementation)
   */
  async getTransactionHistory(limit = 10) {
    console.log('📜 [WALLET] Getting demo transaction history...');
    
    const demoTransactions = [];
    for (let i = 0; i < Math.min(limit, 5); i++) {
      demoTransactions.push({
        id: `demo_tx_${Date.now() - i * 60000}`,
        type: i % 2 === 0 ? 'send' : 'receive',
        amount: BigInt(Math.floor(Math.random() * 1000000000000)),
        token: 'KTA',
        address: 'keeta_demo_' + Math.random().toString(36).substr(2, 8),
        timestamp: Date.now() - i * 60000,
        status: 'confirmed'
      });
    }
    
    return demoTransactions;
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(transaction) {
    console.log('💰 [WALLET] Estimating demo transaction fee...');
    
    // Demo fee estimation
    return {
      fee: BigInt('1000000'), // 0.001 KTA
      gasLimit: BigInt('21000'),
      gasPrice: BigInt('50')
    };
  }
}

// Make available globally for the extension
console.log('🔧 [DEMO-WALLET] Export check - typeof window:', typeof window);
console.log('🔧 [DEMO-WALLET] Export check - typeof self:', typeof self);
console.log('🔧 [DEMO-WALLET] Checking if in service worker (no DOM):', typeof document === 'undefined');

// Prioritize self over window to handle service worker with window shim
if (typeof self !== 'undefined' && typeof document === 'undefined') {
  console.log('🔧 [DEMO-WALLET] Service worker detected - exporting to self.KeetaWalletClient');
  self.KeetaWalletClient = KeetaWalletClient;
  // Also export to window shim for compatibility
  if (typeof window !== 'undefined') {
    window.KeetaWalletClient = KeetaWalletClient;
  }
} else if (typeof window !== 'undefined') {
  console.log('🔧 [DEMO-WALLET] Browser context - exporting to window.KeetaWalletClient');
  window.KeetaWalletClient = KeetaWalletClient;
} else if (typeof self !== 'undefined') {
  console.log('🔧 [DEMO-WALLET] Fallback - exporting to self.KeetaWalletClient');
  self.KeetaWalletClient = KeetaWalletClient;
} else {
  console.log('🔧 [DEMO-WALLET] No global context found for export');
}

console.log('🔧 [DEMO-WALLET] After export - self.KeetaWalletClient exists:', !!(typeof self !== 'undefined' && self.KeetaWalletClient));

// Also export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeetaWalletClient };
}