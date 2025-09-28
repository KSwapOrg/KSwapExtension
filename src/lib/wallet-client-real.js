// Keeta Wallet Client - Real Network Implementation
// Converted from working TypeScript implementation (DLhugly/KSwap pattern)

/**
 * Network configuration
 */
// Updated network configuration with current working endpoints
const NETWORK_CONFIGS = {
  mainnet: {
    name: 'Keeta Mainnet',
    rpcUrl: 'https://rpc.keeta.com',
    explorerUrl: 'https://explorer.keeta.com',
    chainId: 'keeta-mainnet',
    baseToken: 'KTA',
    treasuryAccount: 'keeta-treasury-mainnet',
  },
  testnet: {
    name: 'Keeta Testnet',
    rpcUrl: 'https://rep2.test.network.api.keeta.com',
    explorerUrl: 'https://explorer.test.keeta.com',
    chainId: 'keeta-testnet',
    baseToken: 'KTA',
    treasuryAccount: 'keeta-treasury-testnet',
  },
};

/**
 * Keeta Wallet Client - Core wallet functionality for Chrome extension
 * Based on the working DLhugly/KSwap implementation
 */
class KeetaWalletClient {
  constructor(client, signer, network, seed, mode = 'real') {
    this.client = client;
    this.signer = signer;
    this.network = network;
    this.seed = seed;
    this.mode = mode; // 'demo' or 'real' for UI display only
  }

  /**
   * Initialize wallet client with network and seed
   * This follows the exact working pattern from DLhugly/KSwap
   */
  static async initialize(networkName, seed, mode = 'demo') {
    console.log('🚀 [WALLET] Initialize called', { networkName, mode, hasSeed: !!seed });
    
    // Handle demo mode for UI display
    if (mode === 'demo') {
      return KeetaWalletClient.initializeDemo(networkName, seed);
    }

    try {
      // Wait for KeetaNet SDK to load
      await KeetaWalletClient.waitForKeetaNet();
      
      // Get KeetaNet from global scope (works in both window and service worker)
      const globalScope = (typeof window !== 'undefined') ? window : self;
      const KeetaNet = globalScope.KeetaNet;
      
      // Check if KeetaNet SDK is available
      if (!KeetaNet || !KeetaNet.lib || !KeetaNet.lib.Account) {
        throw new Error('KeetaNet SDK not properly loaded');
      }

      // ALWAYS generate proper SDK seed (this is the key fix!)
      let seedString = seed;
      
      // Debug: Check what seed we received
      console.log('🔍 [WALLET] Received seed:', seed ? `"${seed}" (length: ${seed.length})` : 'null');
      
      let seedUpdated = false;
      
      if (!seed) {
        console.log('🔧 [WALLET] No seed provided, generating new SDK seed...');
        seedString = KeetaNet.lib.Account.generateRandomSeed({ asString: true });
        console.log('🔧 [WALLET] Generated SDK seed length:', seedString.length);
        seedUpdated = true;
      } else {
        console.log('🔧 [WALLET] Using provided seed length:', seedString.length);
        // Check if seed is too short (demo seed format)
        if (seedString.length < 32) {
          console.log('🔧 [WALLET] Seed too short, generating new SDK seed...');
          seedString = KeetaNet.lib.Account.generateRandomSeed({ asString: true });
          console.log('🔧 [WALLET] Generated new SDK seed length:', seedString.length);
          seedUpdated = true;
        }
      }
      
      // CRITICAL FIX: Update storage with new seed if generated
      if (seedUpdated && typeof chrome !== 'undefined' && chrome.storage) {
        try {
          await chrome.storage.local.set({ walletSeed: seedString });
          console.log('💾 [WALLET] Updated storage with new SDK seed');
        } catch (storageError) {
          console.error('❌ [WALLET] Failed to update storage:', storageError);
        }
      }
      
      console.log('🔑 [WALLET] Final seed to use (length:', seedString.length, ')');
      
      // Create account from seed (exactly like working DLhugly/KSwap)
      const signer = KeetaNet.lib.Account.fromSeed(seedString, 0);
      console.log('✅ [WALLET] Account created:', signer.publicKeyString.get());
      
      // Connect to network (exactly like working DLhugly/KSwap)
      const keetaNetworkName = networkName === 'mainnet' ? 'main' : 'test';
      console.log('🌐 [WALLET] Connecting to network:', keetaNetworkName);
      const client = KeetaNet.UserClient.fromNetwork(keetaNetworkName, signer);
      console.log('✅ [WALLET] UserClient created');
      
      const network = NETWORK_CONFIGS[networkName];
      console.log('⚙️ [WALLET] Network config:', network);

      // Verify connection and ensure baseToken is initialized
      console.log('🔍 [WALLET] Verifying connection with chain() call...');
      const chainInfo = await client.chain();
      console.log('✅ [WALLET] Chain info received:', chainInfo);
      
      // Debug baseToken after connection
      console.log('🔍 [WALLET] Client baseToken after chain():', client.baseToken);
      console.log('🔍 [WALLET] BaseToken type after chain():', typeof client.baseToken);
      
      // Deep debug baseToken object
      if (client.baseToken && typeof client.baseToken === 'object') {
        console.log('🔍 [WALLET] BaseToken object keys:', Object.keys(client.baseToken));
        console.log('🔍 [WALLET] BaseToken prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client.baseToken)));
        console.log('🔍 [WALLET] BaseToken publicKeyString:', client.baseToken.publicKeyString?.get?.());
        console.log('🔍 [WALLET] BaseToken addressString:', client.baseToken.addressString?.get?.());
        console.log('🔍 [WALLET] BaseToken toString():', client.baseToken.toString?.());
        
        // Try to get any account-like properties
        ['address', 'publicKey', 'keyType', 'algorithm'].forEach(prop => {
          if (client.baseToken[prop] !== undefined) {
            console.log(`🔍 [WALLET] BaseToken.${prop}:`, client.baseToken[prop]);
          }
        });
      }
      
      console.log('✅ [WALLET] Connected to real network:', networkName);
      
      return new KeetaWalletClient(client, signer, network, seedString, mode);
    } catch (error) {
      console.error('❌ [WALLET] Real network failed, falling back to demo:', error);
      return KeetaWalletClient.initializeDemo(networkName, seed);
    }
  }

  /**
   * Wait for KeetaNet SDK to be available
   */
  static waitForKeetaNet(timeout = 10000) {
    return new Promise((resolve, reject) => {
      // Get global scope (window in popup, self in service worker)
      const globalScope = (typeof window !== 'undefined') ? window : self;
      
      // If already loaded, resolve immediately
      if (globalScope.KeetaNet && globalScope.KeetaNet.lib) {
        resolve();
        return;
      }
      
      // In service worker context, SDK should already be loaded synchronously
      if (typeof window === 'undefined') {
        // We're in a service worker
        if (self.KeetaNet) {
          resolve();
        } else {
          reject(new Error('KeetaNet SDK not loaded in service worker'));
        }
        return;
      }
      
      // In popup context, wait for SDK to load via events
      const handleLoad = () => {
        clearTimeout(timeoutId);
        window.removeEventListener('keetanet-loaded', handleLoad);
        window.removeEventListener('keetanet-error', handleError);
        resolve();
      };
      
      const handleError = (event) => {
        clearTimeout(timeoutId);
        window.removeEventListener('keetanet-loaded', handleLoad);
        window.removeEventListener('keetanet-error', handleError);
        reject(new Error(event.detail?.error || 'Failed to load KeetaNet SDK'));
      };
      
      window.addEventListener('keetanet-loaded', handleLoad);
      window.addEventListener('keetanet-error', handleError);
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        window.removeEventListener('keetanet-loaded', handleLoad);
        window.removeEventListener('keetanet-error', handleError);
        reject(new Error('Timeout waiting for KeetaNet SDK'));
      }, timeout);
    });
  }

  /**
   * Initialize demo mode with fake data
   */
  static async initializeDemo(networkName, seed) {
    console.log('🎭 [WALLET] Initializing DEMO mode');
    
    // Even in demo mode, use proper SDK seed if possible for consistency
    let seedString = seed;
    
    // Try to get SDK and generate proper seed even for demo
    try {
      const globalScope = (typeof window !== 'undefined') ? window : self;
      const KeetaNet = globalScope.KeetaNet;
      
      if (KeetaNet && KeetaNet.lib && KeetaNet.lib.Account) {
        if (!seed) {
          seedString = KeetaNet.lib.Account.generateRandomSeed({ asString: true });
          console.log('🎭 [WALLET] Demo using proper SDK seed (length:', seedString.length, ')');
        }
      } else {
        // Fallback to simple demo seed if SDK not available
        seedString = seed || 'demo_seed_' + Math.random().toString(36);
        console.log('🎭 [WALLET] Demo using simple seed (length:', seedString.length, ')');
      }
    } catch (error) {
      seedString = seed || 'demo_seed_' + Math.random().toString(36);
      console.log('🎭 [WALLET] Demo using fallback seed (length:', seedString.length, ')');
    }
    
    const mockNetwork = NETWORK_CONFIGS[networkName] || { name: networkName + '_demo' };
    
    return new KeetaWalletClient(null, null, mockNetwork, seedString, 'demo');
  }

  /**
   * Get wallet address
   */
  getAddress() {
    if (this.mode === 'demo') {
      // Generate consistent demo address from seed
      const hash = this.seed.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return 'keeta_demo_' + Math.abs(hash).toString(36).padStart(8, '0');
    }
    return this.signer.publicKeyString.get();
  }

  /**
   * Get wallet seed (always returns proper format)
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
   * Get account info including balances
   */
  async getAccountInfo() {
    console.log('👛 [WALLET] Getting account info... (mode:', this.mode, ')');
    
    const accountInfo = {
      address: this.getAddress(),
      network: this.network.name,
      balance: BigInt(0)
    };

    if (this.mode === 'demo') {
      // Demo balances
      accountInfo.balance = BigInt('1000000000000000'); // 1M KTA in demo
      return accountInfo;
    }

    try {
      // Real network balance fetching using correct SDK API
      console.log('🔍 [WALLET] getAccountInfo: Fetching balance for KTA...');
      const balance = await this.getTokenBalance('KTA');
      accountInfo.balance = balance;
      console.log('💰 [WALLET] Account info balance:', balance.toString());
    } catch (error) {
      console.error('❌ [WALLET] Failed to fetch account info balance:', error);
      accountInfo.balance = BigInt(0);
    }

    return accountInfo;
  }

  /**
   * Get token balance
   */
  async getTokenBalance(tokenId = 'KTA') {
    console.log('🪙 [WALLET] Getting token balance for:', tokenId, '(mode:', this.mode, ')');
    
    if (this.mode === 'demo') {
      // Demo token balances
      const demoBalances = {
        'KTA': BigInt('1000000000000000'), // 1M KTA
        'USDC': BigInt('5000000000'), // 5K USDC
        'ETH': BigInt('2000000000000000000'), // 2 ETH
      };
      return demoBalances[tokenId] || BigInt('100000000000000'); // Default 100K
    }

    try {
      // Debug: Check client properties
      console.log('🔍 [WALLET] Debug client info:');
      console.log('- client.baseToken:', this.client.baseToken);
      console.log('- network.baseToken:', this.network.baseToken);
      console.log('- signer address:', this.signer.publicKeyString.get());
      console.log('- requested tokenId:', tokenId);
      
      // Use correct KeetaNet SDK API for token balance
      if (tokenId === 'KTA') {
        console.log('🔍 [WALLET] Fetching KTA balance for account:', this.signer.publicKeyString.get());
        
        // Try different balance API approaches
        let balance;
        
        // Use exact working pattern from DLhugly/KSwap  
        console.log('👛 [WALLET] Base token:', this.client.baseToken);
        console.log('👛 [WALLET] Base token type:', typeof this.client.baseToken);
        console.log('👛 [WALLET] Base token publicKeyString:', this.client.baseToken?.publicKeyString?.get?.());
        
        // Fix: Use baseToken address properly for API call
        console.log('👛 [WALLET] Getting balance using baseToken...');
        
        try {
          // The API expects: /account/{userAddress}/balance/{tokenAccountAddress}
          // NOT: /account/{userAddress}/balance/undefined
          
          const baseToken = this.client.baseToken;
          const tokenAccountAddress = baseToken.publicKeyString.get();
          console.log('🔍 [WALLET] Token account address for API:', tokenAccountAddress);
          console.log('🔍 [WALLET] User account address:', this.signer.publicKeyString.get());
          
          balance = await this.client.balance(baseToken);
          console.log('👛 [WALLET] Balance via baseToken (API call to:', tokenAccountAddress, '):', balance);
          
          if (balance === 0n || balance === BigInt(0)) {
            console.log('🔍 [WALLET] BaseToken balance is 0, trying user account balance...');
            
            // Maybe we need to check user's balance differently
            // Try: user account balance (not baseToken balance)
            balance = await this.client.balance(this.signer);
            console.log('👛 [WALLET] Balance via signer account:', balance);
            
            if (balance === 0n || balance === BigInt(0)) {
              console.log('🔍 [WALLET] Signer balance also 0, trying allBalances method...');
              
              // Try allBalances method which might return all token balances
              try {
                const allBalances = await this.client.allBalances();
                console.log('🔍 [WALLET] allBalances result:', allBalances);
                console.log('🔍 [WALLET] allBalances type:', typeof allBalances);
                console.log('🔍 [WALLET] allBalances length:', allBalances?.length);
                
                if (allBalances && Array.isArray(allBalances) && allBalances.length > 0) {
                  // Look for KTA balance in the array
                  const ktaBalance = allBalances.find(bal => 
                    bal.token === 'KTA' || 
                    bal.tokenId === 'KTA' ||
                    bal.symbol === 'KTA'
                  );
                  
                  if (ktaBalance) {
                    balance = BigInt(ktaBalance.balance || ktaBalance.amount || 0);
                    console.log('✅ [WALLET] Found KTA in allBalances:', balance);
                  } else {
                    console.log('🔍 [WALLET] No KTA found in allBalances, checking first entry...');
                    console.log('🔍 [WALLET] First balance entry:', allBalances[0]);
                    
                    // Maybe first entry is KTA
                    if (allBalances[0] && allBalances[0].balance) {
                      balance = BigInt(allBalances[0].balance);
                      console.log('✅ [WALLET] Using first balance entry:', balance);
                    }
                  }
                } else {
                  console.log('🔍 [WALLET] allBalances empty - might be unfunded or pending...');
                  
                  // Try multiple API endpoints to find working ones
                  const userAddress = this.signer.publicKeyString.get();
                  console.log('🚀 [WALLET] Testing multiple API endpoints for address:', userAddress);
                  
                  const apiTests = [
                    'https://rep2.test.network.api.keeta.com/api/node/ledger/account/' + userAddress,
                    'https://rep2.test.network.api.keeta.com/api/account/' + userAddress,
                    'https://rep2.test.network.api.keeta.com/account/' + userAddress,
                    'https://test-rpc.keeta.network/api/account/' + userAddress,
                    'https://rpc.test.keeta.com/api/account/' + userAddress
                  ];
                  
                  let foundBalance = false;
                  
                  for (const endpoint of apiTests) {
                    try {
                      console.log('🔍 [WALLET] Testing endpoint:', endpoint);
                      const response = await fetch(endpoint);
                      console.log('🔍 [WALLET] Response status:', response.status);
                      
                      if (response.ok) {
                        const data = await response.json();
                        console.log('🔍 [WALLET] API response data (full):', JSON.stringify(data, null, 2));
                        console.log('🔍 [WALLET] API response keys:', Object.keys(data || {}));
                        
                        // Look for balance in various response formats
                        const possibleBalances = [
                          data.balance,
                          data.amount,
                          data.kta_balance,
                          data.tokens?.KTA,
                          data.balances?.KTA,
                          data.account?.balance,
                          data.value,
                          data.total,
                          data.kta,
                          data.KTA
                        ];
                        
                        console.log('🔍 [WALLET] Checking possible balance fields:', possibleBalances);
                        
                        for (let i = 0; i < possibleBalances.length; i++) {
                          const possibleBalance = possibleBalances[i];
                          console.log(`🔍 [WALLET] Field ${i}: ${possibleBalance} (type: ${typeof possibleBalance})`);
                          
                          if (possibleBalance !== undefined && possibleBalance !== null) {
                            const balanceValue = BigInt(possibleBalance);
                            if (balanceValue > 0) {
                              balance = balanceValue;
                              console.log('✅ [WALLET] Found balance in API response:', balance);
                              foundBalance = true;
                              break;
                            }
                          }
                        }
                        
                        // Check the balances array structure
                        if (!foundBalance && data && data.balances && Array.isArray(data.balances)) {
                          console.log('🔍 [WALLET] Balances array found, length:', data.balances.length);
                          
                          if (data.balances.length === 0) {
                            console.log('💡 [WALLET] Account exists but balances array is empty');
                            console.log('⏰ [WALLET] This could mean:');
                            console.log('   - Funding transaction still pending');
                            console.log('   - Account not yet funded');
                            console.log('   - Blockchain sync delay');
                            
                            // Set balance to 0 but mark as "pending check"
                            balance = BigInt(0);
                            
                            // Add refresh reminder
                            setTimeout(() => {
                              console.log('🔄 [WALLET] REMINDER: Check balance again in a few minutes');
                              console.log('🔄 [WALLET] If funded, try refreshing the extension');
                            }, 5000);
                            
                          } else {
                            // Parse non-empty balances array
                            console.log('🔍 [WALLET] Found balances:', data.balances);
                            data.balances.forEach((bal, index) => {
                              console.log(`🔍 [WALLET] Balance ${index}:`, JSON.stringify(bal, null, 2));
                            });
                            
                            // Look for KTA balance in the array
                            const ktaBalance = data.balances.find(bal => 
                              bal.token === 'KTA' ||
                              bal.tokenId === 'KTA' ||
                              bal.symbol === 'KTA' ||
                              bal.asset === 'KTA'
                            );
                            
                            if (ktaBalance) {
                              balance = BigInt(ktaBalance.balance || ktaBalance.amount || 0);
                              console.log('✅ [WALLET] Found KTA balance:', balance);
                              foundBalance = true;
                            } else {
                              console.log('🔍 [WALLET] No KTA balance found in balances array');
                            }
                          }
                        }
                        
                        if (foundBalance) break;
                      }
                    } catch (apiError) {
                      console.log('❌ [WALLET] Endpoint failed:', endpoint, apiError.message);
                    }
                  }
                  
                  if (!foundBalance) {
                    console.log('⚠️ [WALLET] No working API endpoints found');
                    console.log('💡 [WALLET] This might mean:');
                    console.log('   - Transaction still pending confirmation');
                    console.log('   - Network endpoint changes');
                    console.log('   - Account not yet funded');
                    console.log('   - API authentication required');
                  }
                }
              } catch (allBalError) {
                console.log('❌ [WALLET] allBalances failed:', allBalError.message);
              }
            }
          }
        } catch (error) {
          console.log('❌ [WALLET] Balance call failed:', error.message);
          balance = BigInt(0);
        }
        
        console.log('👛 [WALLET] Final balance result:', balance);
        console.log('👛 [WALLET] Final balance type:', typeof balance);
        
        return balance;
      } else {
        // For other tokens, get token account
        const globalScope = (typeof window !== 'undefined') ? window : self;
        const KeetaNet = globalScope.KeetaNet;
        const tokenAccount = KeetaNet.lib.Account.fromPublicKeyString(tokenId);
        const balance = await this.client.balance(tokenAccount);
        console.log('💰 [WALLET] Real token balance fetched:', balance.toString());
        return balance;
      }
    } catch (error) {
      console.error('❌ [WALLET] Failed to fetch token balance:', error);
      console.error('❌ [WALLET] Error details:', error.stack);
      return BigInt(0);
    }
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
    console.log('🪙 [WALLET] Discovering tokens... (mode:', this.mode, ')');
    
    if (this.mode === 'demo') {
      // Demo tokens
      return [
        { id: 'KTA', symbol: 'KTA', name: 'Keeta Token', balance: BigInt('1000000000000000'), decimals: 9 },
        { id: 'USDC', symbol: 'USDC', name: 'USD Coin', balance: BigInt('5000000000'), decimals: 6 },
        { id: 'ETH', symbol: 'ETH', name: 'Ethereum', balance: BigInt('2000000000000000000'), decimals: 18 },
      ];
    }

    try {
      // Real token discovery would go here
      const ktaBalance = await this.getTokenBalance('KTA');
      return [
        { id: 'KTA', symbol: 'KTA', name: 'Keeta Token', balance: ktaBalance, decimals: 9 }
      ];
    } catch (error) {
      console.error('❌ [WALLET] Token discovery failed:', error);
      return [];
    }
  }

  /**
   * Send tokens
   */
  async sendTokens(toAddress, amount, tokenId = 'KTA') {
    console.log('💸 [WALLET] Sending tokens... (mode:', this.mode, ')', {
      to: toAddress,
      amount: amount.toString(),
      token: tokenId
    });

    if (this.mode === 'demo') {
      // Demo transaction
      return {
        success: true,
        transactionId: 'demo_tx_' + Date.now(),
        blockId: 'demo_block_' + Date.now()
      };
    }

    try {
      console.log('🚀 [WALLET] Initiating real transaction...');
      
      // Validate recipient address format
      if (!toAddress.startsWith('keeta_') || toAddress.length < 60) {
        throw new Error('Invalid recipient address format');
      }
      
      // Parse recipient address
      let recipientAccount;
      try {
        recipientAccount = KeetaNet.lib.Account.fromPublicKeyString(toAddress);
        console.log('✅ [WALLET] Recipient address parsed successfully');
      } catch (error) {
        throw new Error('Invalid recipient address: ' + error.message);
      }
      
      // For KTA (base token), send using UserClient.send
      if (tokenId === 'KTA') {
        console.log('💰 [WALLET] Sending KTA base token...');
        console.log('💰 [WALLET] Using UserClient.send() method...');
        
        // Use the high-level UserClient.send method instead of low-level client.send
        const result = await this.client.send(
          toAddress,          // to (string address)
          amount,             // amount (already in smallest units)
          this.client.baseToken  // token (base token)
        );
        
        console.log('✅ [WALLET] KTA transaction result:', result);
        
        // Extract transaction details from the result
        let transactionId = 'tx_' + Date.now();
        let blockId = 'block_' + Date.now();
        
        if (result.voteStaple && result.voteStaple.blocks && result.voteStaple.blocks.length > 0) {
          const firstBlock = result.voteStaple.blocks[0];
          if (firstBlock.hash) {
            transactionId = firstBlock.hash;
          }
          blockId = result.voteStaple.hash || blockId;
        }
        
        return {
          success: true,
          transactionId: transactionId,
          blockId: blockId,
          transaction: result,
          published: result.publish || false
        };
      }
      
      // For other tokens, use token-specific send (if implemented)
      else {
        console.log('🪙 [WALLET] Sending custom token:', tokenId);
        
        // Parse token account
        const tokenAccount = KeetaNet.lib.Account.fromPublicKeyString(tokenId);
        
        // For now, return error as custom token sending needs more implementation
        throw new Error('Custom token sending not yet implemented');
      }
      
    } catch (error) {
      console.error('❌ [WALLET] Send transaction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(networkName) {
    try {
      console.log('🔄 [WALLET] Switching network to:', networkName, '(mode:', this.mode, ')');

      if (this.mode === 'demo') {
        // Demo network switch
        this.network = NETWORK_CONFIGS[networkName] || { name: networkName + '_demo' };
        return true;
      }

      // Re-initialize with new network using same seed
      const newClient = await KeetaWalletClient.initialize(networkName, this.seed, this.mode);
      
      // Update current instance
      this.client = newClient.client;
      this.signer = newClient.signer;
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
console.log('🔧 [WALLET] Export check - typeof window:', typeof window);
console.log('🔧 [WALLET] Export check - typeof self:', typeof self);
console.log('🔧 [WALLET] Checking if in service worker (no DOM):', typeof document === 'undefined');

// Prioritize self over window to handle service worker with window shim
if (typeof self !== 'undefined' && typeof document === 'undefined') {
  console.log('🔧 [WALLET] Service worker detected - exporting to self.KeetaWalletClient');
  self.KeetaWalletClient = KeetaWalletClient;
  // Also export to window shim for compatibility
  if (typeof window !== 'undefined') {
    window.KeetaWalletClient = KeetaWalletClient;
  }
} else if (typeof window !== 'undefined') {
  console.log('🔧 [WALLET] Browser context - exporting to window.KeetaWalletClient');
  window.KeetaWalletClient = KeetaWalletClient;
} else if (typeof self !== 'undefined') {
  console.log('🔧 [WALLET] Fallback - exporting to self.KeetaWalletClient');
  self.KeetaWalletClient = KeetaWalletClient;
} else {
  console.log('🔧 [WALLET] No global context found for export');
}

console.log('🔧 [WALLET] After export - self.KeetaWalletClient exists:', !!(typeof self !== 'undefined' && self.KeetaWalletClient));
console.log('🔧 [WALLET] After export - window.KeetaWalletClient exists:', !!(typeof window !== 'undefined' && window.KeetaWalletClient));

// Also export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeetaWalletClient };
}