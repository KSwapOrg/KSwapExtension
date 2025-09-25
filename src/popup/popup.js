// Keeta Wallet Extension Popup
class WalletPopup {
  constructor() {
    this.wallet = null;
    this.currentNetwork = 'testnet';
    this.currentMode = 'demo';
    this.tokens = [];
    
    this.initializeElements();
    this.attachEventListeners();
    this.loadWallet();
  }

  initializeElements() {
    // Status elements
    this.statusIndicator = document.querySelector('.status-indicator');
    this.statusText = document.getElementById('statusText');
    this.walletContent = document.getElementById('walletContent');
    
    // Account elements
    this.walletAddress = document.getElementById('walletAddress');
    this.tokenList = document.getElementById('tokenList');
    
    // Control elements
    this.modeSelect = document.getElementById('modeSelect');
    this.modeIndicator = document.getElementById('modeIndicator');
    this.copyAddressBtn = document.getElementById('copyAddress');
    
    // Action buttons
    this.sendBtn = document.getElementById('sendBtn');
    this.receiveBtn = document.getElementById('receiveBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    
    // Modals
    this.sendModal = document.getElementById('sendModal');
    this.settingsModal = document.getElementById('settingsModal');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    
    // Send form elements
    this.sendToken = document.getElementById('sendToken');
    this.sendTo = document.getElementById('sendTo');
    this.sendAmount = document.getElementById('sendAmount');
    this.confirmSendBtn = document.getElementById('confirmSend');
    this.cancelSendBtn = document.getElementById('cancelSend');
    this.closeSendBtn = document.getElementById('closeSend');
    
    // Settings elements
    this.closeSettingsBtn = document.getElementById('closeSettings');
    this.showSeedBtn = document.getElementById('showSeed');
    this.currentNetworkSpan = document.getElementById('currentNetwork');
  }

  attachEventListeners() {
    // Mode selection
    this.modeSelect.addEventListener('change', (e) => {
      this.switchMode(e.target.value);
    });
    
    // Copy address
    this.copyAddressBtn.addEventListener('click', () => {
      this.copyAddress();
    });
    
    // Action buttons
    this.sendBtn.addEventListener('click', () => {
      this.openSendModal();
    });
    
    this.receiveBtn.addEventListener('click', () => {
      this.showReceiveInfo();
    });
    
    this.settingsBtn.addEventListener('click', () => {
      this.openSettingsModal();
    });
    
    // Send modal
    this.confirmSendBtn.addEventListener('click', () => {
      this.sendTokens();
    });
    
    this.cancelSendBtn.addEventListener('click', () => {
      this.closeSendModal();
    });
    
    this.closeSendBtn.addEventListener('click', () => {
      this.closeSendModal();
    });
    
    // Settings modal
    this.closeSettingsBtn.addEventListener('click', () => {
      this.closeSettingsModal();
    });
    
    this.showSeedBtn.addEventListener('click', () => {
      this.showSeedPhrase();
    });
    
    // Close modals on background click
    this.sendModal.addEventListener('click', (e) => {
      if (e.target === this.sendModal) {
        this.closeSendModal();
      }
    });
    
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.closeSettingsModal();
      }
    });
  }

  async loadWallet() {
    try {
      this.updateStatus('connecting', 'Connecting to wallet...');
      
      // Get stored seed and preferences
      const result = await chrome.storage.local.get(['walletSeed', 'selectedNetwork', 'selectedMode']);
      const seed = result.walletSeed;
      this.currentNetwork = result.selectedNetwork || 'testnet';
      this.currentMode = result.selectedMode || 'demo';
      
      // Update mode selector
      this.modeSelect.value = this.currentMode;
      
      if (!seed) {
        // First time setup - generate new wallet
        await this.createNewWallet();
      } else {
        // Load existing wallet
        await this.loadExistingWallet(seed);
      }
      
    } catch (error) {
      console.error('Failed to load wallet:', error);
      this.updateStatus('error', 'Failed to connect');
    }
  }

  async createNewWallet() {
    try {
      // Use global KeetaWalletClient
      if (!window.KeetaWalletClient) {
        throw new Error('KeetaWalletClient not available');
      }
      
      this.wallet = await window.KeetaWalletClient.initialize(this.currentNetwork, null, this.currentMode);
      
      // Store seed and preferences securely
      await chrome.storage.local.set({
        walletSeed: this.wallet.getSeed(),
        selectedNetwork: this.currentNetwork,
        selectedMode: this.currentMode
      });
      
      await this.updateWalletDisplay();
      this.updateStatus('connected', 'Wallet created');
      this.updateModeIndicator();
      
    } catch (error) {
      console.error('Failed to create wallet:', error);
      this.updateStatus('error', 'Failed to create wallet');
    }
  }

  async loadExistingWallet(seed) {
    try {
      // Use global KeetaWalletClient
      if (!window.KeetaWalletClient) {
        throw new Error('KeetaWalletClient not available');
      }
      
      this.wallet = await window.KeetaWalletClient.initialize(this.currentNetwork, seed, this.currentMode);
      
      await this.updateWalletDisplay();
      this.updateStatus('connected', 'Connected');
      this.updateModeIndicator();
      
    } catch (error) {
      console.error('Failed to load wallet:', error);
      this.updateStatus('error', 'Failed to connect');
    }
  }

  async updateWalletDisplay() {
    if (!this.wallet) return;
    
    try {
      // Update address
      const address = this.wallet.getAddress();
      this.walletAddress.textContent = this.formatAddress(address);
      
      // Update tokens
      await this.updateTokenList();
      
      // Show wallet content
      this.walletContent.classList.remove('hidden');
      
    } catch (error) {
      console.error('Failed to update wallet display:', error);
    }
  }

  async updateTokenList() {
    if (!this.wallet) return;
    
    try {
      this.tokens = await this.wallet.getAvailableTokens();
      
      // Clear existing list
      this.tokenList.innerHTML = '';
      
      // Add tokens
      this.tokens.forEach(token => {
        const tokenElement = this.createTokenElement(token);
        this.tokenList.appendChild(tokenElement);
      });
      
      // Update send token options
      this.updateSendTokenOptions();
      
    } catch (error) {
      console.error('Failed to update token list:', error);
    }
  }

  createTokenElement(token) {
    const div = document.createElement('div');
    div.className = 'token-item';
    
    const balance = Number(token.balance) / Math.pow(10, token.decimals);
    
    div.innerHTML = `
      <div class="token-info">
        <div class="token-symbol">${token.symbol}</div>
        <div class="token-name">${token.name}</div>
      </div>
      <div class="token-balance">${balance.toFixed(4)}</div>
    `;
    
    return div;
  }

  updateSendTokenOptions() {
    this.sendToken.innerHTML = '';
    
    this.tokens.forEach(token => {
      const option = document.createElement('option');
      option.value = token.id;
      option.textContent = `${token.symbol} (${token.name})`;
      this.sendToken.appendChild(option);
    });
  }

  updateStatus(type, message) {
    this.statusIndicator.className = `status-indicator ${type}`;
    this.statusText.textContent = message;
  }

  formatAddress(address) {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  }

  async switchMode(mode) {
    if (mode === this.currentMode) return;
    
    try {
      this.showLoading('Switching mode...');
      
      // Parse mode to get network and mode
      const [modeType, networkName] = this.parseMode(mode);
      
      // Re-initialize wallet with new mode
      const seed = this.wallet ? this.wallet.getSeed() : null;
      this.wallet = await window.KeetaWalletClient.initialize(networkName, seed, modeType);
      
      this.currentMode = mode;
      this.currentNetwork = networkName;
      
      // Store preferences
      await chrome.storage.local.set({ 
        selectedMode: mode,
        selectedNetwork: networkName
      });
      
      await this.updateWalletDisplay();
      this.updateStatus('connected', `Connected to ${mode}`);
      this.updateModeIndicator();
      
    } catch (error) {
      console.error('Failed to switch mode:', error);
      this.updateStatus('error', 'Mode switch failed');
      // Revert mode selector
      this.modeSelect.value = this.currentMode;
    } finally {
      this.hideLoading();
    }
  }

  parseMode(mode) {
    switch(mode) {
      case 'demo':
        return ['demo', 'testnet'];
      case 'testnet':
        return ['testnet', 'testnet'];
      case 'mainnet':
        return ['mainnet', 'mainnet'];
      default:
        return ['demo', 'testnet'];
    }
  }

  updateModeIndicator() {
    if (!this.modeIndicator) return;
    
    const modeColors = {
      'demo': '🎭 Demo',
      'testnet': '🧪 Test',
      'mainnet': '🚀 Live'
    };
    
    this.modeIndicator.textContent = modeColors[this.currentMode] || '🎭 Demo';
    this.modeIndicator.className = `mode-indicator ${this.currentMode}`;
  }

  async copyAddress() {
    if (!this.wallet) return;
    
    try {
      const address = this.wallet.getAddress();
      await navigator.clipboard.writeText(address);
      
      // Show feedback
      const originalText = this.copyAddressBtn.textContent;
      this.copyAddressBtn.textContent = 'Copied!';
      setTimeout(() => {
        this.copyAddressBtn.textContent = originalText;
      }, 2000);
      
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }

  openSendModal() {
    this.sendModal.classList.remove('hidden');
  }

  closeSendModal() {
    this.sendModal.classList.add('hidden');
    this.clearSendForm();
  }

  clearSendForm() {
    this.sendTo.value = '';
    this.sendAmount.value = '';
  }

  async sendTokens() {
    if (!this.wallet) return;
    
    const tokenId = this.sendToken.value;
    const toAddress = this.sendTo.value.trim();
    const amount = this.sendAmount.value.trim();
    
    if (!tokenId || !toAddress || !amount) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      this.showLoading('Sending tokens...');
      
      const token = this.tokens.find(t => t.id === tokenId);
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, token.decimals)));
      
      const result = await this.wallet.sendTokens(toAddress, amountBigInt, tokenId);
      
      if (result.success) {
        this.closeSendModal();
        await this.updateTokenList();
        alert('Tokens sent successfully!');
      } else {
        alert(`Send failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Send failed:', error);
      alert('Send failed: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  showReceiveInfo() {
    if (!this.wallet) return;
    
    const address = this.wallet.getAddress();
    
    // Create a simple receive dialog
    const message = `Your Keeta address:\n\n${address}\n\nSend this address to receive tokens.`;
    
    if (confirm(message + '\n\nCopy to clipboard?')) {
      navigator.clipboard.writeText(address);
    }
  }

  openSettingsModal() {
    this.currentNetworkSpan.textContent = this.currentNetwork;
    this.settingsModal.classList.remove('hidden');
  }

  closeSettingsModal() {
    this.settingsModal.classList.add('hidden');
  }

  async showSeedPhrase() {
    if (!this.wallet) return;
    
    const confirmed = confirm(
      '⚠️ WARNING: Your seed phrase gives full access to your wallet.\n\n' +
      'Never share it with anyone and store it safely.\n\n' +
      'Click OK to reveal your seed phrase.'
    );
    
    if (confirmed) {
      const seed = this.wallet.getSeed();
      
      // Create a temporary dialog to show seed
      const seedDialog = document.createElement('div');
      seedDialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 3000;
        max-width: 300px;
        word-break: break-all;
        font-family: monospace;
        font-size: 12px;
        border: 2px solid #e74c3c;
      `;
      
      seedDialog.innerHTML = `
        <h4 style="margin-bottom: 10px; color: #e74c3c;">🔑 Seed Phrase</h4>
        <p style="margin-bottom: 15px; font-size: 11px; color: #666;">
          Keep this safe and private!
        </p>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          ${seed}
        </div>
        <button id="copySeed" style="margin-right: 10px; padding: 5px 10px;">Copy</button>
        <button id="closeSeed" style="padding: 5px 10px;">Close</button>
      `;
      
      document.body.appendChild(seedDialog);
      
      // Add event listeners
      document.getElementById('copySeed').onclick = () => {
        navigator.clipboard.writeText(seed);
        alert('Seed copied to clipboard!');
      };
      
      document.getElementById('closeSeed').onclick = () => {
        document.body.removeChild(seedDialog);
      };
    }
  }

  showLoading(message) {
    document.getElementById('loadingText').textContent = message;
    this.loadingOverlay.classList.remove('hidden');
  }

  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WalletPopup();
});
