// Keeta Wallet Extension Background Service Worker

class WalletBackground {
  constructor() {
    this.wallet = null;
    this.pendingRequests = new Map();
    this.connectedSites = new Set();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('Keeta Wallet Extension installed:', details.reason);
      this.initializeWallet();
    });

    // Extension startup
    chrome.runtime.onStartup.addListener(() => {
      console.log('Keeta Wallet Extension starting up');
      this.initializeWallet();
    });

    // Messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Tab updates (for cleaning up disconnected sites)
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.cleanupTab(tabId);
    });
  }

  async initializeWallet() {
    try {
      // Get stored wallet data
      const result = await chrome.storage.local.get(['walletSeed', 'selectedNetwork']);
      
      if (result.walletSeed) {
        // Import wallet client
        const { KeetaWalletClient } = await import('../lib/wallet-client.js');
        
        const network = result.selectedNetwork || 'testnet';
        this.wallet = await KeetaWalletClient.initialize(network, result.walletSeed);
        
        console.log('Wallet initialized in background');
      }
    } catch (error) {
      console.error('Failed to initialize wallet in background:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    console.log('Background received message:', request.type, 'from:', sender.tab?.url);

    switch (request.type) {
      case 'CONNECT_WALLET':
        await this.handleConnect(request, sender, sendResponse);
        break;

      case 'GET_ACCOUNT':
        await this.handleGetAccount(request, sender, sendResponse);
        break;

      case 'SIGN_TRANSACTION':
        await this.handleSignTransaction(request, sender, sendResponse);
        break;

      case 'SEND_TRANSACTION':
        await this.handleSendTransaction(request, sender, sendResponse);
        break;

      case 'GET_BALANCE':
        await this.handleGetBalance(request, sender, sendResponse);
        break;

      case 'SWITCH_NETWORK':
        await this.handleSwitchNetwork(request, sender, sendResponse);
        break;

      case 'DISCONNECT':
        await this.handleDisconnect(request, sender, sendResponse);
        break;

      default:
        sendResponse({ error: 'Unknown request type' });
    }
  }

  async handleConnect(request, sender, sendResponse) {
    try {
      if (!this.wallet) {
        await this.initializeWallet();
      }

      if (!this.wallet) {
        sendResponse({ error: 'Wallet not initialized' });
        return;
      }

      const siteUrl = new URL(sender.tab.url).origin;
      
      // Check if site is already connected
      if (this.connectedSites.has(siteUrl)) {
        const accountInfo = await this.wallet.getAccountInfo();
        sendResponse({
          success: true,
          account: {
            address: accountInfo.address,
            network: accountInfo.network
          }
        });
        return;
      }

      // Show connection approval popup
      const approved = await this.showConnectionApproval(siteUrl);
      
      if (approved) {
        this.connectedSites.add(siteUrl);
        const accountInfo = await this.wallet.getAccountInfo();
        
        sendResponse({
          success: true,
          account: {
            address: accountInfo.address,
            network: accountInfo.network
          }
        });
      } else {
        sendResponse({ error: 'User rejected connection' });
      }

    } catch (error) {
      console.error('Connect failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleGetAccount(request, sender, sendResponse) {
    try {
      if (!this.wallet) {
        sendResponse({ error: 'Wallet not initialized' });
        return;
      }

      const siteUrl = new URL(sender.tab.url).origin;
      
      if (!this.connectedSites.has(siteUrl)) {
        sendResponse({ error: 'Site not connected' });
        return;
      }

      const accountInfo = await this.wallet.getAccountInfo();
      
      sendResponse({
        success: true,
        account: {
          address: accountInfo.address,
          network: accountInfo.network,
          balance: accountInfo.balance.toString()
        }
      });

    } catch (error) {
      console.error('Get account failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleSignTransaction(request, sender, sendResponse) {
    try {
      if (!this.wallet) {
        sendResponse({ error: 'Wallet not initialized' });
        return;
      }

      const siteUrl = new URL(sender.tab.url).origin;
      
      if (!this.connectedSites.has(siteUrl)) {
        sendResponse({ error: 'Site not connected' });
        return;
      }

      // Show transaction approval popup
      const approved = await this.showTransactionApproval(request.transaction, siteUrl);
      
      if (approved) {
        const result = await this.wallet.signTransaction(request.transaction);
        sendResponse(result);
      } else {
        sendResponse({ error: 'User rejected transaction' });
      }

    } catch (error) {
      console.error('Sign transaction failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleSendTransaction(request, sender, sendResponse) {
    try {
      if (!this.wallet) {
        sendResponse({ error: 'Wallet not initialized' });
        return;
      }

      const siteUrl = new URL(sender.tab.url).origin;
      
      if (!this.connectedSites.has(siteUrl)) {
        sendResponse({ error: 'Site not connected' });
        return;
      }

      const { toAddress, amount, tokenId } = request;
      
      // Show send approval popup
      const approved = await this.showSendApproval({
        to: toAddress,
        amount: amount,
        token: tokenId,
        site: siteUrl
      });
      
      if (approved) {
        const result = await this.wallet.sendTokens(toAddress, BigInt(amount), tokenId);
        sendResponse(result);
      } else {
        sendResponse({ error: 'User rejected transaction' });
      }

    } catch (error) {
      console.error('Send transaction failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleGetBalance(request, sender, sendResponse) {
    try {
      if (!this.wallet) {
        sendResponse({ error: 'Wallet not initialized' });
        return;
      }

      const siteUrl = new URL(sender.tab.url).origin;
      
      if (!this.connectedSites.has(siteUrl)) {
        sendResponse({ error: 'Site not connected' });
        return;
      }

      const balance = await this.wallet.getTokenBalance(request.tokenId || 'KTA');
      
      sendResponse({
        success: true,
        balance: balance.toString()
      });

    } catch (error) {
      console.error('Get balance failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleSwitchNetwork(request, sender, sendResponse) {
    try {
      if (!this.wallet) {
        sendResponse({ error: 'Wallet not initialized' });
        return;
      }

      const success = await this.wallet.switchNetwork(request.network);
      
      if (success) {
        // Notify all connected sites about network change
        this.notifyNetworkChange(request.network);
        sendResponse({ success: true });
      } else {
        sendResponse({ error: 'Network switch failed' });
      }

    } catch (error) {
      console.error('Switch network failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleDisconnect(request, sender, sendResponse) {
    const siteUrl = new URL(sender.tab.url).origin;
    this.connectedSites.delete(siteUrl);
    
    sendResponse({ success: true });
  }

  async showConnectionApproval(siteUrl) {
    // In a real implementation, this would show a popup window
    // For now, we'll auto-approve for development
    console.log('Connection request from:', siteUrl);
    return true;
  }

  async showTransactionApproval(transaction, siteUrl) {
    // In a real implementation, this would show a popup window
    console.log('Transaction approval request from:', siteUrl, transaction);
    return true;
  }

  async showSendApproval(details) {
    // In a real implementation, this would show a popup window
    console.log('Send approval request:', details);
    return true;
  }

  notifyNetworkChange(network) {
    // Notify all connected sites about network change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url) {
          const siteUrl = new URL(tab.url).origin;
          if (this.connectedSites.has(siteUrl)) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'NETWORK_CHANGED',
              network: network
            }).catch(() => {
              // Tab might not have content script loaded
            });
          }
        }
      });
    });
  }

  cleanupTab(tabId) {
    // Clean up any pending requests for this tab
    for (const [requestId, request] of this.pendingRequests) {
      if (request.tabId === tabId) {
        this.pendingRequests.delete(requestId);
      }
    }
  }
}

// Initialize background service
new WalletBackground();
