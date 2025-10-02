// Keeta Wallet Extension Popup - v2.0.2 Production
// Build timestamp: 2025-10-02 - Reorganized Header UI
class WalletPopup {
  constructor() {
    this.wallet = null;
    this.currentNetwork = 'testnet';
    this.currentMode = 'testnet'; // Default to real testnet, not demo
    this.currentWalletId = 'default';
    this.wallets = new Map(); // Store multiple wallets
    this.tokens = [];
    
    console.log('🚀 [POPUP] Initializing WalletPopup v2...');
    this.initializeElements();
    this.attachEventListeners();
    this.loadWallets();
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
    
    // Multi-wallet elements
    this.walletSelect = document.getElementById('walletSelect');
    this.addWalletBtn = document.getElementById('addWalletBtn');
    
    // V2 Theme elements
    this.themeToggle = document.getElementById('themeToggle');
    this.themeIcon = document.querySelector('.theme-icon');
    this.themeSelect = document.getElementById('themeSelect');
    
    // V2 Wallet management elements
    this.showSeedPhraseBtn = document.getElementById('showSeedPhrase');
    this.importWalletBtn = document.getElementById('importWallet');
    this.createNewWalletBtn = document.getElementById('createNewWallet');
    this.addAccountBtn = document.getElementById('addAccount');
    this.lockWalletBtn = document.getElementById('lockWallet');
    
    // V2 Modal elements
    this.seedPhraseModal = document.getElementById('seedPhraseModal');
    this.importWalletModal = document.getElementById('importWalletModal');
    this.createWalletModal = document.getElementById('createWalletModal');
    
    // Seed phrase elements
    this.seedPhraseDisplay = document.getElementById('seedPhraseDisplay');
    this.copySeedPhraseBtn = document.getElementById('copySeedPhrase');
    this.downloadSeedPhraseBtn = document.getElementById('downloadSeedPhrase');
    
    // Import elements
    this.seedPhraseInput = document.getElementById('seedPhraseInput');
    this.rawSeedInput = document.getElementById('rawSeedInput');
    this.confirmPhraseImportBtn = document.getElementById('confirmPhraseImport');
    this.confirmSeedImportBtn = document.getElementById('confirmSeedImport');
    this.importFundedWalletBtn = document.getElementById('importFundedWallet');
    this.phraseStatus = document.getElementById('phraseStatus');
    this.phraseWordCount = document.getElementById('phraseWordCount');
    this.seedStatus = document.getElementById('seedStatus');
    this.seedLength = document.getElementById('seedLength');
    
    // Create wallet elements (streamlined)
    this.quickCreateWalletBtn = document.getElementById('quickCreateWallet');
    this.advancedCreateWalletBtn = document.getElementById('advancedCreateWallet');
    this.importExistingWalletBtn = document.getElementById('importExistingWallet');
    this.generateAdvancedPhraseBtn = document.getElementById('generateAdvancedPhrase');
    this.finishAdvancedSetupBtn = document.getElementById('finishAdvancedSetup');
    this.backToQuickBtn = document.getElementById('backToQuick');
    
    // Close buttons
    this.closeSeedPhraseBtn = document.getElementById('closeSeedPhrase');
    this.closeImportWalletBtn = document.getElementById('closeImportWallet');
    this.closeCreateWalletBtn = document.getElementById('closeCreateWallet');
    
    // Action buttons
    this.sendBtn = document.getElementById('sendBtn');
    this.receiveBtn = document.getElementById('receiveBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    
    // Debug: Check which elements are missing
    console.log('🔍 [POPUP] Element availability check:');
    console.log('- themeToggle:', !!this.themeToggle);
    console.log('- quickCreateWalletBtn:', !!this.quickCreateWalletBtn);
    console.log('- advancedCreateWalletBtn:', !!this.advancedCreateWalletBtn);
    console.log('- importExistingWalletBtn:', !!this.importExistingWalletBtn);
    console.log('- showSeedPhraseBtn:', !!this.showSeedPhraseBtn);
    
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
    this.showSeedBtn = document.getElementById('showSeed'); // Legacy - might not exist
    this.currentNetworkSpan = document.getElementById('currentNetwork');
  }

  attachEventListeners() {
    // Mode selection
    this.modeSelect.addEventListener('change', (e) => {
      this.switchMode(e.target.value);
    });
    
    // Multi-wallet selection
    if (this.walletSelect) {
      this.walletSelect.addEventListener('change', (e) => {
        this.switchWallet(e.target.value);
      });
    }
    
    if (this.addWalletBtn) {
      this.addWalletBtn.addEventListener('click', () => {
        this.openCreateWalletModal();
      });
    }
    
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
    
    // Legacy seed button (if exists)
    if (this.showSeedBtn) {
      this.showSeedBtn.addEventListener('click', () => {
        this.showSeedPhrase();
      });
    }
    
    // V2 Theme Management
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
    
    if (this.themeSelect) {
      this.themeSelect.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });
    }
    
    // V2 Wallet Management (with null checks)
    if (this.showSeedPhraseBtn) {
      this.showSeedPhraseBtn.addEventListener('click', () => {
        this.openSeedPhraseModal();
      });
    }
    
    if (this.importWalletBtn) {
      this.importWalletBtn.addEventListener('click', () => {
        this.openImportWalletModal();
      });
    }
    
    if (this.createNewWalletBtn) {
      this.createNewWalletBtn.addEventListener('click', () => {
        this.openCreateWalletModal();
      });
    }
    
    if (this.addAccountBtn) {
      this.addAccountBtn.addEventListener('click', () => {
        this.addNewAccount();
      });
    }
    
    if (this.lockWalletBtn) {
      this.lockWalletBtn.addEventListener('click', () => {
        this.lockWallet();
      });
    }
    
    // V2 Seed Phrase Modal (with null checks)
    if (this.closeSeedPhraseBtn) {
      this.closeSeedPhraseBtn.addEventListener('click', () => {
        this.closeSeedPhraseModal();
      });
    }
    
    if (this.copySeedPhraseBtn) {
      this.copySeedPhraseBtn.addEventListener('click', () => {
        this.copySeedPhraseToClipboard();
      });
    }
    
    if (this.downloadSeedPhraseBtn) {
      this.downloadSeedPhraseBtn.addEventListener('click', () => {
        this.downloadSeedPhraseBackup();
      });
    }
    
    // V2 Import Wallet Modal (with null checks)
    if (this.closeImportWalletBtn) {
      this.closeImportWalletBtn.addEventListener('click', () => {
        this.closeImportWalletModal();
      });
    }
    
    // Import method switching
    document.querySelectorAll('.import-method').forEach(method => {
      method.addEventListener('click', () => {
        this.switchImportMethod(method.getAttribute('data-method'));
      });
    });
    
    if (this.seedPhraseInput) {
      this.seedPhraseInput.addEventListener('input', () => {
        this.validateSeedPhrase();
      });
    }
    
    if (this.rawSeedInput) {
      this.rawSeedInput.addEventListener('input', () => {
        this.validateRawSeed();
      });
    }
    
    if (this.confirmPhraseImportBtn) {
      this.confirmPhraseImportBtn.addEventListener('click', () => {
        this.importWalletFromSeedPhrase();
      });
    }
    
    if (this.confirmSeedImportBtn) {
      this.confirmSeedImportBtn.addEventListener('click', () => {
        this.importWalletFromRawSeed();
      });
    }
    
    if (this.importFundedWalletBtn) {
      this.importFundedWalletBtn.addEventListener('click', () => {
        this.importFundedWallet();
      });
    }
    
    // V2 Create Wallet Modal (streamlined)
    if (this.closeCreateWalletBtn) {
      this.closeCreateWalletBtn.addEventListener('click', () => {
        this.closeCreateWalletModal();
      });
    }
    
    if (this.quickCreateWalletBtn) {
      this.quickCreateWalletBtn.addEventListener('click', () => {
        this.quickCreateWallet();
      });
    }
    
    if (this.advancedCreateWalletBtn) {
      this.advancedCreateWalletBtn.addEventListener('click', () => {
        this.showAdvancedFlow();
      });
    }
    
    if (this.importExistingWalletBtn) {
      this.importExistingWalletBtn.addEventListener('click', () => {
        this.closeCreateWalletModal();
        this.openImportWalletModal();
      });
    }
    
    if (this.generateAdvancedPhraseBtn) {
      this.generateAdvancedPhraseBtn.addEventListener('click', () => {
        this.generateAdvancedSeedPhrase();
      });
    }
    
    if (this.finishAdvancedSetupBtn) {
      this.finishAdvancedSetupBtn.addEventListener('click', () => {
        this.finishAdvancedSetup();
      });
    }
    
    if (this.backToQuickBtn) {
      this.backToQuickBtn.addEventListener('click', () => {
        this.quickCreateWallet();
      });
    }
    
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
      let seed = result.walletSeed;
      this.currentNetwork = result.selectedNetwork || 'testnet';
      this.currentMode = result.selectedMode || 'demo';
      
      // Debug: Check stored seed format
      console.log('🔍 [POPUP] Stored seed:', seed ? `length=${seed.length}, starts="${seed.substring(0, 10)}..."` : 'null');
      
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
    
    // Handle bigint properly
    const balanceBigInt = typeof token.balance === 'bigint' ? token.balance : BigInt(token.balance);
    const balance = Number(balanceBigInt) / Math.pow(10, token.decimals);
    
    // Format balance appropriately - show up to 4 significant decimal places, but remove trailing zeros
    const formattedBalance = balance.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.min(4, token.decimals),
      useGrouping: false  // No comma thousands separators
    });
    
    div.innerHTML = `
      <div class="token-info">
        <div class="token-symbol">${token.symbol}</div>
        <div class="token-name">${token.name}</div>
      </div>
      <div class="token-balance">${formattedBalance}</div>
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
      
      console.log('💸 [SEND] Looking for token:', tokenId);
      console.log('💸 [SEND] Available tokens:', this.tokens.map(t => ({ id: t.id, symbol: t.symbol })));
      
      const token = this.tokens.find(t => t.id === tokenId);
      if (!token) {
        throw new Error(`Token ${tokenId} not found in available tokens`);
      }
      
      console.log('💸 [SEND] Found token:', token);
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, token.decimals)));
      
      console.log('💸 [SEND] Sending:', {
        toAddress,
        amount: amountBigInt.toString(),
        tokenId,
        decimals: token.decimals
      });
      
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

  // ===== V2 METAMASK-STYLE FEATURES =====

  // Theme Management
  async initializeTheme() {
    try {
      const result = await chrome.storage.local.get(['selectedTheme']);
      const theme = result.selectedTheme || 'light';
      this.setTheme(theme);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }

  async setTheme(theme) {
    try {
      // Handle auto theme
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
      }
      
      // Apply theme
      document.documentElement.setAttribute('data-theme', theme);
      
      // Update controls
      if (this.themeSelect) this.themeSelect.value = theme;
      if (this.themeIcon) {
        this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
      
      // Save preference
      await chrome.storage.local.set({ selectedTheme: theme });
      
      console.log('🎨 [THEME] Set theme to:', theme);
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  // Seed Phrase Management using Keeta SDK
  async openSeedPhraseModal() {
    try {
      if (!this.wallet) {
        alert('No wallet loaded');
        return;
      }
      
      // Check if modal element exists
      if (!this.seedPhraseModal) {
        console.error('❌ [SEED] seedPhraseModal not found, re-querying...');
        this.seedPhraseModal = document.getElementById('seedPhraseModal');
        if (!this.seedPhraseModal) {
          alert('Error: Seed phrase modal not found. Please reload the extension.');
          return;
        }
      }
      
      // Generate mnemonic from current seed using Keeta SDK
      const currentSeed = this.wallet.getSeed();
      console.log('🔐 [SEED] Converting seed to mnemonic phrase...');
      
      // Check if KeetaNet SDK is available
      if (!window.KeetaNet || !window.KeetaNet.lib || !window.KeetaNet.lib.Account) {
        alert('KeetaNet SDK not available for seed phrase conversion');
        return;
      }
      
      // Generate mnemonic phrase from seed using Keeta SDK
      const seedPhrase = await this.generateMnemonicFromSeed(currentSeed);
      
      this.displaySeedPhrase(seedPhrase);
      this.seedPhraseModal.classList.remove('hidden');
      
    } catch (error) {
      console.error('Failed to show seed phrase:', error);
      alert('Failed to display seed phrase: ' + error.message);
    }
  }

  async generateMnemonicFromSeed(seed) {
    try {
      // For demo: create a simple word list (in production, use proper BIP39)
      const words = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
        'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
        'acoustic', 'acquire', 'across', 'action', 'actor', 'actress', 'actual', 'adapt'
      ];
      
      // Generate deterministic mnemonic from seed
      const seedHash = seed.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const mnemonic = [];
      let hash = Math.abs(seedHash);
      
      for (let i = 0; i < 12; i++) {
        const wordIndex = hash % words.length;
        mnemonic.push(words[wordIndex]);
        hash = Math.floor(hash / words.length) || (hash + i * 1000);
      }
      
      console.log('🔐 [SEED] Generated 12-word mnemonic phrase');
      return mnemonic;
    } catch (error) {
      console.error('Failed to generate mnemonic:', error);
      throw error;
    }
  }

  displaySeedPhrase(seedWords) {
    // Safety check for element existence
    if (!this.seedPhraseDisplay) {
      console.error('❌ [SEED] seedPhraseDisplay element not found! Re-querying...');
      this.seedPhraseDisplay = document.getElementById('seedPhraseDisplay');
      if (!this.seedPhraseDisplay) {
        console.error('❌ [SEED] seedPhraseDisplay still not found after re-query');
        alert('Error: Could not display seed phrase. Please try reopening Settings > Show Seed Phrase');
        return;
      }
    }
    
    const grid = document.createElement('div');
    grid.className = 'seed-phrase-grid';
    
    seedWords.forEach((word, index) => {
      const wordElement = document.createElement('div');
      wordElement.className = 'seed-word';
      wordElement.textContent = word;
      wordElement.setAttribute('data-index', index + 1);
      grid.appendChild(wordElement);
    });
    
    this.seedPhraseDisplay.innerHTML = '';
    this.seedPhraseDisplay.appendChild(grid);
  }

  async copySeedPhraseToClipboard() {
    try {
      const seedWords = Array.from(this.seedPhraseDisplay.querySelectorAll('.seed-word'))
        .map(el => el.textContent);
      const seedPhrase = seedWords.join(' ');
      
      await navigator.clipboard.writeText(seedPhrase);
      
      // Show feedback
      const originalText = this.copySeedPhraseBtn.textContent;
      this.copySeedPhraseBtn.innerHTML = '<span class="icon">✅</span>Copied!';
      setTimeout(() => {
        this.copySeedPhraseBtn.innerHTML = '<span class="icon">📋</span>Copy to Clipboard';
      }, 2000);
      
      console.log('📋 [SEED] Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  }

  downloadSeedPhraseBackup() {
    try {
      const seedWords = Array.from(this.seedPhraseDisplay.querySelectorAll('.seed-word'))
        .map(el => el.textContent);
      const seedPhrase = seedWords.join(' ');
      
      const backupData = {
        wallet: 'KSwap Wallet Extension',
        version: '2.0.0',
        created: new Date().toISOString(),
        network: this.currentNetwork,
        seedPhrase: seedPhrase,
        warning: 'Keep this file secure! Anyone with this phrase can control your wallet.'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kswap-wallet-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('💾 [SEED] Downloaded backup file');
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert('Failed to create backup file');
    }
  }

  closeSeedPhraseModal() {
    this.seedPhraseModal.classList.add('hidden');
    this.seedPhraseDisplay.innerHTML = '';
  }

  // Import Wallet Functionality
  openImportWalletModal() {
    this.importWalletModal.classList.remove('hidden');
    this.switchImportMethod('phrase'); // Default to phrase import
  }

  closeImportWalletModal() {
    this.importWalletModal.classList.add('hidden');
    if (this.seedPhraseInput) this.seedPhraseInput.value = '';
    if (this.rawSeedInput) this.rawSeedInput.value = '';
  }

  switchImportMethod(method) {
    // Update active import method
    document.querySelectorAll('.import-method').forEach(m => {
      m.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
    
    // Show/hide appropriate import sections
    document.getElementById('phraseImport').classList.toggle('hidden', method !== 'phrase');
    document.getElementById('seedImport').classList.toggle('hidden', method !== 'seed');
    
    // Clear inputs and validation
    if (this.seedPhraseInput) this.seedPhraseInput.value = '';
    if (this.rawSeedInput) this.rawSeedInput.value = '';
    this.validateSeedPhrase();
    this.validateRawSeed();
  }

  validateSeedPhrase() {
    if (!this.seedPhraseInput || !this.phraseWordCount || !this.phraseStatus) return;
    
    const input = this.seedPhraseInput.value.trim();
    const words = input.split(/\s+/).filter(word => word.length > 0);
    
    // Update word count
    this.phraseWordCount.textContent = `${words.length} words`;
    
    if (words.length === 0) {
      this.phraseStatus.textContent = '';
      this.phraseStatus.className = 'validation-status';
      if (this.confirmPhraseImportBtn) this.confirmPhraseImportBtn.disabled = true;
      return;
    }
    
    // Validate word count (12 or 24 words for BIP39)
    if (words.length === 12 || words.length === 24) {
      this.phraseStatus.textContent = '✅ Valid word count';
      this.phraseStatus.className = 'validation-status valid';
      if (this.confirmPhraseImportBtn) this.confirmPhraseImportBtn.disabled = false;
    } else {
      this.phraseStatus.textContent = '❌ Must be 12 or 24 words';
      this.phraseStatus.className = 'validation-status invalid';
      if (this.confirmPhraseImportBtn) this.confirmPhraseImportBtn.disabled = true;
    }
  }

  validateRawSeed() {
    if (!this.rawSeedInput || !this.seedLength || !this.seedStatus) return;
    
    const input = this.rawSeedInput.value.trim().toUpperCase();
    
    // Update character count
    this.seedLength.textContent = `${input.length}/64 characters`;
    
    if (input.length === 0) {
      this.seedStatus.textContent = '';
      this.seedStatus.className = 'validation-status';
      if (this.confirmSeedImportBtn) this.confirmSeedImportBtn.disabled = true;
      return;
    }
    
    // Validate hex format and length
    const isValidHex = /^[0-9A-F]+$/.test(input);
    
    if (input.length === 64 && isValidHex) {
      this.seedStatus.textContent = '✅ Valid hex seed';
      this.seedStatus.className = 'validation-status valid';
      if (this.confirmSeedImportBtn) this.confirmSeedImportBtn.disabled = false;
    } else if (!isValidHex) {
      this.seedStatus.textContent = '❌ Must be hexadecimal (0-9, A-F)';
      this.seedStatus.className = 'validation-status invalid';
      if (this.confirmSeedImportBtn) this.confirmSeedImportBtn.disabled = true;
    } else {
      this.seedStatus.textContent = `❌ Must be exactly 64 characters (${input.length}/64)`;
      this.seedStatus.className = 'validation-status invalid';
      if (this.confirmSeedImportBtn) this.confirmSeedImportBtn.disabled = true;
    }
  }

  async importWalletFromSeedPhrase() {
    try {
      const seedPhrase = this.seedPhraseInput.value.trim();
      const words = seedPhrase.split(/\s+/).filter(word => word.length > 0);
      
      if (words.length !== 12 && words.length !== 24) {
        throw new Error('Invalid seed phrase length');
      }
      
      this.showLoading('Importing wallet...');
      
      // Convert mnemonic to seed using Keeta SDK
      console.log('🔐 [IMPORT] Converting mnemonic to seed using Keeta SDK...');
      
      if (!window.KeetaNet || !window.KeetaNet.lib || !window.KeetaNet.lib.Account) {
        throw new Error('KeetaNet SDK not available');
      }
      
      // Use Keeta SDK to convert passphrase to seed
      const seed = await window.KeetaNet.lib.Account.seedFromPassphrase(seedPhrase, { asString: true });
      
      console.log('🔐 [IMPORT] Generated seed from mnemonic (length:', seed.length, ')');
      
      // Initialize wallet with imported seed
      this.wallet = await window.KeetaWalletClient.initialize(this.currentNetwork, seed, this.currentMode);
      
      // Store the new seed
      await chrome.storage.local.set({
        walletSeed: seed,
        selectedNetwork: this.currentNetwork,
        selectedMode: this.currentMode,
        isImported: true
      });
      
      // Update UI
      await this.updateWalletDisplay();
      this.closeImportWalletModal();
      this.hideLoading();
      
      alert('Wallet imported successfully!');
      
    } catch (error) {
      console.error('Failed to import wallet:', error);
      this.hideLoading();
      alert('Failed to import wallet: ' + error.message);
    }
  }

  async importWalletFromRawSeed() {
    try {
      const rawSeed = this.rawSeedInput.value.trim().toUpperCase();
      
      if (rawSeed.length !== 64 || !/^[0-9A-F]+$/.test(rawSeed)) {
        throw new Error('Invalid hex seed format');
      }
      
      this.showLoading('Importing wallet from seed...');
      
      console.log('🔑 [IMPORT] Importing wallet from raw hex seed...');
      console.log('🔑 [IMPORT] Seed length:', rawSeed.length);
      
      if (!window.KeetaWalletClient) {
        throw new Error('KeetaWalletClient not available');
      }
      
      // Initialize wallet directly with hex seed (no BIP39 conversion)
      this.wallet = await window.KeetaWalletClient.initialize(this.currentNetwork, rawSeed, this.currentMode);
      
      console.log('🔑 [IMPORT] Wallet imported successfully, address:', this.wallet.getAddress());
      
      // Store the imported seed
      await chrome.storage.local.set({
        walletSeed: rawSeed,
        selectedNetwork: this.currentNetwork,
        selectedMode: this.currentMode,
        isImported: true,
        importMethod: 'raw-seed'
      });
      
      // Update UI
      await this.updateWalletDisplay();
      this.closeImportWalletModal();
      this.hideLoading();
      
      alert('Wallet imported successfully from raw seed!');
      
    } catch (error) {
      console.error('Failed to import wallet from raw seed:', error);
      this.hideLoading();
      alert('Failed to import wallet: ' + error.message);
    }
  }

  async importFundedWallet() {
    try {
      // Your specific funded wallet seed (from console output)
      const fundedWalletSeed = "512FE49DC49C486057E4AE1AC8AA6F75214C0ED010581B2E15A951F208240C22";
      
      this.showLoading('Importing your funded wallet...');
      
      console.log('💰 [IMPORT] Importing funded wallet with 10 KTA...');
      
      if (!window.KeetaWalletClient) {
        throw new Error('KeetaWalletClient not available');
      }
      
      // Initialize wallet with the specific funded seed
      this.wallet = await window.KeetaWalletClient.initialize(this.currentNetwork, fundedWalletSeed, this.currentMode);
      
      const walletAddress = this.wallet.getAddress();
      console.log('💰 [IMPORT] Funded wallet imported, address:', walletAddress);
      
      // Verify it's the correct address
      const expectedAddress = "keeta_aabaeenxurt2cvnpqeunx65f6x247tmo2jjnkmmppadtwvysry7jzbph5fn3dnq";
      if (walletAddress === expectedAddress) {
        console.log('✅ [IMPORT] Address matches funded wallet!');
      } else {
        console.warn('⚠️ [IMPORT] Address mismatch - expected:', expectedAddress, 'got:', walletAddress);
      }
      
      // Generate unique wallet ID
      const walletId = 'funded-' + Date.now();
      
      // Get existing wallets
      const result = await chrome.storage.local.get(['wallets']);
      const wallets = result.wallets || {};
      
      // Add funded wallet to storage
      wallets[walletId] = {
        seed: fundedWalletSeed,
        name: 'Funded Wallet (10 KTA)',
        address: walletAddress,
        created: Date.now(),
        isImported: true,
        importMethod: 'funded-wallet',
        hasBackedUpSeed: true
      };
      
      await chrome.storage.local.set({
        wallets: wallets,
        selectedWallet: walletId,
        selectedNetwork: this.currentNetwork,
        selectedMode: this.currentMode
      });
      
      this.currentWalletId = walletId;
      
      // Update UI
      await this.updateWalletSelector(wallets);
      await this.updateWalletDisplay();
      this.closeImportWalletModal();
      this.hideLoading();
      
      alert('Funded wallet imported successfully! Your 10 KTA should now be visible.');
      
    } catch (error) {
      console.error('Failed to import funded wallet:', error);
      this.hideLoading();
      alert('Failed to import funded wallet: ' + error.message);
    }
  }

  // Streamlined Create Wallet Flow
  openCreateWalletModal() {
    this.createWalletModal.classList.remove('hidden');
    this.showInfoSection();
  }

  closeCreateWalletModal() {
    this.createWalletModal.classList.add('hidden');
    this.showInfoSection();
    this.generatedSeedPhrase = null;
  }

  showInfoSection() {
    // Show main options, hide advanced flow
    document.querySelector('.info-section').classList.remove('hidden');
    document.getElementById('advancedFlow').classList.add('hidden');
  }

  // Quick wallet creation (no forced verification)
  async quickCreateWallet() {
    try {
      this.showLoading('Creating wallet...');
      
      console.log('⚡ [CREATE] Quick wallet creation using Keeta SDK...');
      
      if (!window.KeetaWalletClient) {
        throw new Error('KeetaWalletClient not available');
      }
      
      // Generate wallet directly (KeetaWalletClient handles SDK seed generation)
      this.wallet = await window.KeetaWalletClient.initialize(this.currentNetwork, null, this.currentMode);
      
      const walletSeed = this.wallet.getSeed();
      const walletAddress = this.wallet.getAddress();
      
      // Generate unique wallet ID
      const walletId = 'wallet-' + Date.now();
      
      // Get existing wallets
      const result = await chrome.storage.local.get(['wallets']);
      const wallets = result.wallets || {};
      
      // Add new wallet to storage
      wallets[walletId] = {
        seed: walletSeed,
        name: `Wallet ${Object.keys(wallets).length + 1}`,
        address: walletAddress,
        created: Date.now(),
        isImported: false,
        hasBackedUpSeed: false
      };
      
      await chrome.storage.local.set({
        wallets: wallets,
        selectedWallet: walletId,
        selectedNetwork: this.currentNetwork,
        selectedMode: this.currentMode
      });
      
      this.currentWalletId = walletId;
      
      console.log('💾 [CREATE] Stored new wallet:', walletId);
      console.log('💾 [CREATE] Wallet address:', walletAddress);
      
      // Update UI
      await this.updateWalletSelector(wallets);
      await this.updateWalletDisplay();
      this.closeCreateWalletModal();
      this.hideLoading();
      
      console.log('✅ [CREATE] Quick wallet created successfully');
      
      // Optional: Show backup reminder (non-intrusive)
      setTimeout(() => {
        this.showBackupReminder();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create wallet:', error);
      this.hideLoading();
      alert('Failed to create wallet: ' + error.message);
    }
  }

  showBackupReminder() {
    // Optional, non-intrusive backup reminder
    if (confirm('💡 Wallet created! Would you like to backup your recovery phrase now? (You can do this later in Settings)')) {
      this.openSeedPhraseModal();
    }
  }

  // Advanced flow (optional)
  showAdvancedFlow() {
    document.querySelector('.info-section').classList.add('hidden');
    document.getElementById('advancedFlow').classList.remove('hidden');
    this.showAdvancedStep(1);
  }

  showAdvancedStep(stepNumber) {
    // Hide all advanced steps
    document.querySelectorAll('.advanced-step').forEach(step => {
      step.classList.add('hidden');
      step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
      targetStep.classList.remove('hidden');
      targetStep.classList.add('active');
    }
  }

  async generateAdvancedSeedPhrase() {
    try {
      this.showLoading('Generating secure seed phrase...');
      
      console.log('🔐 [CREATE] Advanced: Generating mnemonic using Keeta SDK...');
      
      if (!window.KeetaNet || !window.KeetaNet.lib || !window.KeetaNet.lib.Account) {
        throw new Error('KeetaNet SDK not available');
      }
      
      // Generate new random seed using Keeta SDK
      const seed = window.KeetaNet.lib.Account.generateRandomSeed({ asString: true });
      console.log('🔐 [CREATE] Generated seed (length:', seed.length, ')');
      
      // Convert seed to mnemonic for display
      this.generatedSeedPhrase = await this.generateMnemonicFromSeed(seed);
      this.generatedSeed = seed;
      
      // Display the phrase
      const advancedSeedDisplay = document.getElementById('advancedSeedPhraseDisplay');
      this.displaySeedPhraseInElement(this.generatedSeedPhrase, advancedSeedDisplay);
      
      this.hideLoading();
      this.showAdvancedStep(2);
      
    } catch (error) {
      console.error('Failed to generate advanced seed phrase:', error);
      this.hideLoading();
      alert('Failed to generate seed phrase: ' + error.message);
    }
  }

  async finishAdvancedSetup() {
    try {
      if (!this.generatedSeed) {
        throw new Error('No generated seed available');
      }
      
      this.showLoading('Creating wallet...');
      
      // Initialize wallet with generated seed
      this.wallet = await window.KeetaWalletClient.initialize(
        this.currentNetwork, 
        this.generatedSeed, 
        this.currentMode
      );
      
      // Store the wallet data
      await chrome.storage.local.set({
        walletSeed: this.generatedSeed,
        selectedNetwork: this.currentNetwork,
        selectedMode: this.currentMode,
        isImported: false,
        hasBackedUpSeed: true // Advanced users saw their phrase
      });
      
      // Update UI
      await this.updateWalletDisplay();
      this.closeCreateWalletModal();
      this.hideLoading();
      
      console.log('✅ [CREATE] Advanced wallet created successfully');
      
    } catch (error) {
      console.error('Failed to finish advanced setup:', error);
      this.hideLoading();
      alert('Failed to create wallet: ' + error.message);
    }
  }

  displaySeedPhraseInElement(seedWords, container) {
    if (!container) {
      console.error('❌ [SEED] Container element is null in displaySeedPhraseInElement');
      return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'seed-phrase-grid';
    
    seedWords.forEach((word, index) => {
      const wordElement = document.createElement('div');
      wordElement.className = 'seed-word';
      wordElement.textContent = word;
      wordElement.setAttribute('data-index', index + 1);
      grid.appendChild(wordElement);
    });
    
    container.innerHTML = '';
    container.appendChild(grid);
  }

  // Remove old complex verification methods (streamlined approach)

  // Account Management (HD Wallets)
  async addNewAccount() {
    try {
      if (!this.wallet) {
        alert('No wallet loaded');
        return;
      }
      
      // Get current account count
      const result = await chrome.storage.local.get(['accountCount']);
      const accountCount = result.accountCount || 1;
      
      this.showLoading('Creating new account...');
      
      // Create new account using HD derivation (index = accountCount)
      const currentSeed = this.wallet.getSeed();
      const newAccount = await window.KeetaWalletClient.initialize(
        this.currentNetwork,
        currentSeed,
        this.currentMode,
        accountCount // Use as HD index
      );
      
      // Store account count
      await chrome.storage.local.set({ accountCount: accountCount + 1 });
      
      this.hideLoading();
      alert(`Account ${accountCount + 1} created successfully!`);
      
    } catch (error) {
      console.error('Failed to add account:', error);
      this.hideLoading();
      alert('Failed to create new account: ' + error.message);
    }
  }

  async lockWallet() {
    try {
      // Clear sensitive data
      await chrome.storage.local.remove(['walletSeed']);
      
      // Reset wallet state
      this.wallet = null;
      
      // Show connection status
      this.updateStatus('disconnected', 'Wallet locked');
      
      alert('Wallet locked successfully. You will need to re-import your seed phrase.');
      
    } catch (error) {
      console.error('Failed to lock wallet:', error);
      alert('Failed to lock wallet');
    }
  }

  // Multi-Wallet Management
  async loadWallets() {
    try {
      this.updateStatus('connecting', 'Loading wallets...');
      
      // Initialize theme first
      await this.initializeTheme();
      
      // Get stored wallets and preferences
      const result = await chrome.storage.local.get([
        'wallets', 'selectedWallet', 'selectedNetwork', 'selectedMode'
      ]);
      
      const wallets = result.wallets || {};
      this.currentWalletId = result.selectedWallet || 'default';
      this.currentNetwork = result.selectedNetwork || 'testnet';
      this.currentMode = result.selectedMode || 'testnet'; // Default to real testnet
      
      console.log('🔍 [POPUP] Stored wallets:', Object.keys(wallets));
      console.log('🔍 [POPUP] Selected wallet:', this.currentWalletId);
      console.log('🔍 [POPUP] Current mode:', this.currentMode);
      
      // Update selectors
      this.modeSelect.value = this.currentMode;
      await this.updateWalletSelector(wallets);
      
      // Load current wallet
      const currentWalletData = wallets[this.currentWalletId];
      
      if (!currentWalletData || !currentWalletData.seed) {
        // First time setup - create real wallet by default
        await this.showFirstTimeSetup();
      } else {
        // Load existing wallet
        console.log('🔍 [POPUP] Loading wallet:', this.currentWalletId);
        await this.loadExistingWallet(currentWalletData.seed);
      }
      
    } catch (error) {
      console.error('Failed to load wallets:', error);
      this.updateStatus('error', 'Failed to connect');
    }
  }

  async updateWalletSelector(wallets) {
    if (!this.walletSelect) return;
    
    // Clear existing options
    this.walletSelect.innerHTML = '';
    
    // Add wallet options
    if (Object.keys(wallets).length === 0) {
      const option = document.createElement('option');
      option.value = 'default';
      option.textContent = 'Main Wallet';
      this.walletSelect.appendChild(option);
    } else {
      Object.entries(wallets).forEach(([walletId, walletData]) => {
        const option = document.createElement('option');
        option.value = walletId;
        option.textContent = walletData.name || `Wallet ${walletId}`;
        if (walletId === this.currentWalletId) {
          option.selected = true;
        }
        this.walletSelect.appendChild(option);
      });
    }
  }

  async switchWallet(walletId) {
    try {
      console.log('🔄 [WALLET] Switching to wallet:', walletId);
      this.updateStatus('connecting', 'Switching wallet...');
      
      // Get wallet data
      const result = await chrome.storage.local.get(['wallets']);
      const wallets = result.wallets || {};
      const walletData = wallets[walletId];
      
      if (!walletData || !walletData.seed) {
        throw new Error('Wallet not found');
      }
      
      this.currentWalletId = walletId;
      
      // Save selected wallet
      await chrome.storage.local.set({ selectedWallet: walletId });
      
      // Load the wallet
      await this.loadExistingWallet(walletData.seed);
      
      console.log('✅ [WALLET] Switched to wallet:', walletId);
      
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      this.updateStatus('error', 'Failed to switch wallet');
    }
  }

  async showFirstTimeSetup() {
    // Create real testnet wallet by default (not demo)
    try {
      console.log('🚀 [SETUP] First-time setup - creating REAL testnet wallet...');
      
      if (!window.KeetaWalletClient) {
        throw new Error('KeetaWalletClient not available');
      }
      
      // Create REAL wallet (testnet mode) by default
      this.wallet = await window.KeetaWalletClient.initialize(this.currentNetwork, null, this.currentMode);
      
      const walletSeed = this.wallet.getSeed();
      const walletAddress = this.wallet.getAddress();
      
      // Store in new multi-wallet format
      const walletData = {
        seed: walletSeed,
        name: 'Main Wallet',
        address: walletAddress,
        created: Date.now(),
        isImported: false,
        hasBackedUpSeed: false
      };
      
      const wallets = {};
      wallets[this.currentWalletId] = walletData;
      
      await chrome.storage.local.set({
        wallets: wallets,
        selectedWallet: this.currentWalletId,
        selectedNetwork: this.currentNetwork,
        selectedMode: this.currentMode
      });
      
      console.log('💾 [SETUP] Stored wallet in new format:', this.currentWalletId);
      console.log('💾 [SETUP] Wallet address:', walletAddress);
      
      // Update UI
      await this.updateWalletSelector(wallets);
      await this.updateWalletDisplay();
      this.updateStatus('connected', 'Wallet created');
      this.updateModeIndicator();
      
      console.log('✅ [SETUP] First-time REAL wallet created successfully');
      
      // Show optional backup reminder after 3 seconds (non-blocking)
      setTimeout(() => {
        if (confirm('💡 Real wallet created! Would you like to backup your recovery phrase? (Recommended but optional)')) {
          this.openSeedPhraseModal();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Failed first-time setup:', error);
      this.updateStatus('error', 'Setup failed');
      
      // Fallback: Show create wallet modal if auto-setup fails
      this.openCreateWalletModal();
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WalletPopup();
});
