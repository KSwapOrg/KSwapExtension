// Keeta Wallet Client - JavaScript version for Chrome extension
class KeetaWalletClient {
  constructor(network, seed) {
    this.network = network;
    this.seed = seed;
    this.address = 'keeta_demo_address_' + Math.random().toString(36).substr(2, 9);
    this.tokens = [];
  }

  /**
   * Initialize wallet client with network and seed
   */
  static async initialize(networkName, seed) {
    console.log('🚀 [WALLET] Initialize called', { networkName, hasSeed: !!seed });
    
    try {
      // Generate or use provided seed
      const seedString = seed || 'demo_seed_' + Math.random().toString(36);
      console.log('🔑 [WALLET] Seed ready');
      
      console.log('✅ [WALLET] Connected to network:', networkName);
      
      const client = new KeetaWalletClient(networkName, seedString);
      return client;
    } catch (error) {
      console.error('❌ [WALLET] Initialize failed:', error);
      throw new Error(`Failed to initialize wallet: ${error.message}`);
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
    console.log('👛 [WALLET] Getting account info...');
    
    return {
      address: this.getAddress(),
      baseToken: 'KTA',
      balance: BigInt('1000000000'), // 1 KTA with 9 decimals
      network: this.network
    };
  }

  /**
   * Get token balance for a specific token
   */
  async getTokenBalance(tokenId) {
    if (tokenId === 'KTA') {
      return BigInt('1000000000'); // 1 KTA with 9 decimals
    }
    return BigInt('0');
  }

  /**
   * Send tokens to another address
   */
  async sendTokens(toAddress, amount, tokenId = 'KTA') {
    try {
      console.log('💸 [WALLET] Sending tokens...', { toAddress, amount: amount.toString(), tokenId });
      
      // Simulate send
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ [WALLET] Tokens sent successfully');
      return { success: true, transactionId: 'demo_tx_' + Date.now() };
    } catch (error) {
      console.error('❌ [WALLET] Send failed:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error' 
      };
    }
  }

  /**
   * Get available tokens (discovered from blockchain)
   */
  async getAvailableTokens() {
    console.log('🪙 [WALLET] Discovering tokens...');
    
    return [
      {
        id: 'KTA',
        symbol: 'KTA',
        name: 'Keeta',
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

  /**
   * Get token information
   */
  async getTokenInfo(tokenId) {
    if (tokenId === 'KTA') {
      return {
        id: 'KTA',
        symbol: 'KTA',
        name: 'Keeta',
        decimals: 9,
        balance: BigInt('1000000000')
      };
    }
    return null;
  }

  /**
   * Sign a transaction (for DApp integration)
   */
  async signTransaction(transaction) {
    try {
      console.log('✍️ [WALLET] Signing transaction...', transaction);
      return { success: true, signature: 'demo_signature_' + Date.now() };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Signing failed' 
      };
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(networkName) {
    try {
      console.log('🌐 [WALLET] Switching to network:', networkName);
      this.network = networkName;
      console.log('✅ [WALLET] Network switched successfully');
      return true;
    } catch (error) {
      console.error('❌ [WALLET] Network switch failed:', error);
      return false;
    }
  }
}

// Make available globally for the extension
if (typeof window !== 'undefined') {
  window.KeetaWalletClient = KeetaWalletClient;
}

// Also export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeetaWalletClient };
}
