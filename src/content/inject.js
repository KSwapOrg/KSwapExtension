// Keeta Wallet Extension Content Script
// This script injects the Keeta provider into web pages

(function() {
  'use strict';

  // Prevent multiple injections
  if (window.keetaWalletInjected) {
    return;
  }
  window.keetaWalletInjected = true;

  console.log('🚀 Keeta Wallet: Injecting provider...');

  // Create the Keeta provider
  class KeetaProvider {
    constructor() {
      this.isKeeta = true;
      this.isConnected = false;
      this.selectedAddress = null;
      this.chainId = 'keeta-testnet';
      this.networkVersion = 'testnet';
      
      this.eventListeners = new Map();
      
      // Listen for messages from background script
      window.addEventListener('message', (event) => {
        if (event.source !== window || !event.data.type) return;
        
        if (event.data.type === 'KEETA_RESPONSE') {
          this.handleResponse(event.data);
        } else if (event.data.type === 'NETWORK_CHANGED') {
          this.handleNetworkChange(event.data.network);
        }
      });
    }

    // Connect to wallet
    async connect() {
      console.log('🔗 Keeta: Connect requested');
      
      try {
        const response = await this.sendMessage({
          type: 'CONNECT_WALLET'
        });

        if (response.success) {
          this.isConnected = true;
          this.selectedAddress = response.account.address;
          this.networkVersion = response.account.network;
          
          // Emit connect event
          this.emit('connect', {
            address: this.selectedAddress,
            network: this.networkVersion
          });
          
          return [this.selectedAddress];
        } else {
          throw new Error(response.error || 'Connection failed');
        }
      } catch (error) {
        console.error('Keeta connect failed:', error);
        throw error;
      }
    }

    // Get current account
    async getAccount() {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      try {
        const response = await this.sendMessage({
          type: 'GET_ACCOUNT'
        });

        if (response.success) {
          return response.account;
        } else {
          throw new Error(response.error || 'Failed to get account');
        }
      } catch (error) {
        console.error('Keeta getAccount failed:', error);
        throw error;
      }
    }

    // Get balance
    async getBalance(tokenId = 'KTA') {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      try {
        const response = await this.sendMessage({
          type: 'GET_BALANCE',
          tokenId: tokenId
        });

        if (response.success) {
          return response.balance;
        } else {
          throw new Error(response.error || 'Failed to get balance');
        }
      } catch (error) {
        console.error('Keeta getBalance failed:', error);
        throw error;
      }
    }

    // Sign transaction
    async signTransaction(transaction) {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      try {
        const response = await this.sendMessage({
          type: 'SIGN_TRANSACTION',
          transaction: transaction
        });

        if (response.success) {
          return response.signature;
        } else {
          throw new Error(response.error || 'Transaction signing failed');
        }
      } catch (error) {
        console.error('Keeta signTransaction failed:', error);
        throw error;
      }
    }

    // Send transaction
    async sendTransaction(toAddress, amount, tokenId = 'KTA') {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      try {
        const response = await this.sendMessage({
          type: 'SEND_TRANSACTION',
          toAddress: toAddress,
          amount: amount,
          tokenId: tokenId
        });

        if (response.success) {
          // Emit transaction event
          this.emit('transaction', {
            to: toAddress,
            amount: amount,
            token: tokenId
          });
          
          return response.transactionId;
        } else {
          throw new Error(response.error || 'Transaction failed');
        }
      } catch (error) {
        console.error('Keeta sendTransaction failed:', error);
        throw error;
      }
    }

    // Switch network
    async switchNetwork(network) {
      try {
        const response = await this.sendMessage({
          type: 'SWITCH_NETWORK',
          network: network
        });

        if (response.success) {
          this.networkVersion = network;
          this.chainId = `keeta-${network}`;
          
          // Emit network change event
          this.emit('networkChanged', network);
          
          return true;
        } else {
          throw new Error(response.error || 'Network switch failed');
        }
      } catch (error) {
        console.error('Keeta switchNetwork failed:', error);
        throw error;
      }
    }

    // Disconnect
    async disconnect() {
      try {
        await this.sendMessage({
          type: 'DISCONNECT'
        });

        this.isConnected = false;
        this.selectedAddress = null;
        
        // Emit disconnect event
        this.emit('disconnect');
        
        return true;
      } catch (error) {
        console.error('Keeta disconnect failed:', error);
        throw error;
      }
    }

    // Event handling
    on(event, callback) {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }

    emit(event, data) {
      if (this.eventListeners.has(event)) {
        this.eventListeners.get(event).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Event listener error:', error);
          }
        });
      }
    }

    // Send message to background script
    async sendMessage(message) {
      return new Promise((resolve, reject) => {
        const messageId = Math.random().toString(36).substr(2, 9);
        
        // Set up response listener
        const responseListener = (event) => {
          if (event.data.type === 'KEETA_RESPONSE' && event.data.messageId === messageId) {
            window.removeEventListener('message', responseListener);
            resolve(event.data.response);
          }
        };
        
        window.addEventListener('message', responseListener);
        
        // Send message to background
        chrome.runtime.sendMessage({
          ...message,
          messageId: messageId
        }, (response) => {
          if (chrome.runtime.lastError) {
            window.removeEventListener('message', responseListener);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            window.removeEventListener('message', responseListener);
            resolve(response);
          }
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('message', responseListener);
          reject(new Error('Request timeout'));
        }, 30000);
      });
    }

    handleResponse(data) {
      // Handle responses from background script
      console.log('Keeta provider received response:', data);
    }

    handleNetworkChange(network) {
      this.networkVersion = network;
      this.chainId = `keeta-${network}`;
      this.emit('networkChanged', network);
    }

    // Legacy methods for compatibility
    request(args) {
      const { method, params = [] } = args;
      
      switch (method) {
        case 'keeta_connect':
          return this.connect();
        case 'keeta_getAccount':
          return this.getAccount();
        case 'keeta_getBalance':
          return this.getBalance(params[0]);
        case 'keeta_signTransaction':
          return this.signTransaction(params[0]);
        case 'keeta_sendTransaction':
          return this.sendTransaction(params[0], params[1], params[2]);
        case 'keeta_switchNetwork':
          return this.switchNetwork(params[0]);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    }

    // Check if Keeta is available
    isKeetaAvailable() {
      return true;
    }
  }

  // Create and inject the provider
  const keetaProvider = new KeetaProvider();
  
  // Inject into window
  Object.defineProperty(window, 'keeta', {
    value: keetaProvider,
    writable: false,
    configurable: false
  });

  // Also provide as window.keetaWallet for compatibility
  Object.defineProperty(window, 'keetaWallet', {
    value: keetaProvider,
    writable: false,
    configurable: false
  });

  // Dispatch ready event
  window.dispatchEvent(new CustomEvent('keetaWalletReady', {
    detail: {
      provider: keetaProvider,
      version: '1.0.0'
    }
  }));

  console.log('✅ Keeta Wallet: Provider injected successfully');

})();
