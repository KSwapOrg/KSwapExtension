# Keeta Wallet Extension

A secure Chrome extension wallet for the Keeta Network, extracted and adapted from the K-Swap DEX project.

## Features

### 🔐 Secure Wallet Management
- **Seed-based Account Generation**: Create and restore wallets using secure seed phrases
- **Local Storage**: Encrypted storage of wallet data in Chrome's secure storage
- **Network Support**: Seamless switching between Keeta testnet and mainnet
- **Address Management**: Easy copying and sharing of wallet addresses

### 💰 Token Management
- **Multi-Token Support**: Manage KTA and custom Keeta tokens
- **Real-time Balances**: Automatic balance updates and token discovery
- **Token Information**: Display token names, symbols, and metadata
- **Send/Receive**: Easy token transfers with confirmation dialogs

### 🌐 DApp Integration
- **Web3-style Provider**: Inject `window.keeta` for DApp compatibility
- **Connection Management**: Secure connection approval for websites
- **Transaction Signing**: Sign and approve transactions from DApps
- **Event System**: Real-time notifications for account and network changes

### 🎨 User Interface
- **Clean Design**: Modern, intuitive popup interface
- **Responsive Layout**: Optimized for Chrome extension popup
- **Dark/Light Themes**: Automatic theme adaptation
- **Loading States**: Clear feedback for all operations

## Installation

### From Source (Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KSwapOrg/KSwapExtension.git
   cd KSwapExtension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked" and select the extension directory
   - The Keeta Wallet icon should appear in your extensions bar

### From Chrome Web Store
*Coming soon - extension will be published after testing*

## Usage

### First Time Setup

1. **Click the extension icon** in your Chrome toolbar
2. **Create new wallet** - A secure seed phrase will be generated
3. **Backup your seed** - Store it safely (never share it!)
4. **Select network** - Choose testnet for development or mainnet for production

### Basic Operations

#### Viewing Balances
- Open the extension popup to see all your token balances
- Balances update automatically when the popup opens
- Tokens are discovered automatically from the blockchain

#### Sending Tokens
1. Click "Send" in the popup
2. Select the token you want to send
3. Enter recipient address (starts with `keeta_`)
4. Enter amount and click "Send"
5. Confirm the transaction

#### Receiving Tokens
1. Click "Receive" to see your address
2. Copy the address and share with the sender
3. Tokens will appear in your balance automatically

#### Network Switching
- Use the network selector in the popup header
- Choose between testnet and mainnet
- All balances and connections will update automatically

### DApp Integration

#### For DApp Developers

The extension injects a `window.keeta` provider that DApps can use:

```javascript
// Check if Keeta Wallet is available
if (window.keeta && window.keeta.isKeeta) {
  console.log('Keeta Wallet detected!');
  
  // Connect to wallet
  const accounts = await window.keeta.connect();
  console.log('Connected account:', accounts[0]);
  
  // Get account info
  const account = await window.keeta.getAccount();
  console.log('Account details:', account);
  
  // Get balance
  const balance = await window.keeta.getBalance('KTA');
  console.log('KTA balance:', balance);
  
  // Send transaction
  const txId = await window.keeta.sendTransaction(
    'keeta_recipient_address',
    '1000000000', // 1 KTA (9 decimals)
    'KTA'
  );
  console.log('Transaction sent:', txId);
  
  // Listen for events
  window.keeta.on('networkChanged', (network) => {
    console.log('Network changed to:', network);
  });
  
  window.keeta.on('accountChanged', (account) => {
    console.log('Account changed to:', account);
  });
}
```

#### Testing with K-Swap

The extension works perfectly with the K-Swap DEX:

1. **Install the extension** and create a wallet
2. **Open K-Swap** at `http://localhost:3001`
3. **Connect wallet** - The extension will handle the connection
4. **Use DEX features** - Create pools, add liquidity, swap tokens

## Architecture

### Component Structure

```
src/
├── background/           # Service worker for background operations
│   └── service-worker.js # Handles DApp requests and wallet state
├── popup/               # Extension popup interface
│   ├── popup.html       # Main popup HTML
│   ├── popup.css        # Popup styles
│   └── popup.js         # Popup logic and wallet interactions
├── content/             # Content scripts for DApp integration
│   └── inject.js        # Injects Keeta provider into web pages
├── lib/                 # Core wallet functionality
│   └── wallet-client.ts # Wallet client (extracted from K-Swap)
└── types/              # TypeScript type definitions
    └── index.ts        # Shared types (from K-Swap)
```

### Key Components Extracted from K-Swap

1. **WalletClient** (`src/lib/wallet-client.ts`)
   - Core wallet functionality from `kswap-client.ts`
   - Network connection and account management
   - Token operations and balance queries

2. **Type Definitions** (`src/types/index.ts`)
   - Complete type system from K-Swap
   - Token, Account, and Network types
   - Error handling types

3. **UI Patterns** (`src/popup/`)
   - Design patterns from K-Swap components
   - Token selector and balance display logic
   - Network switching and connection management

## Security Features

### 🔒 Secure Storage
- Seed phrases encrypted in Chrome's secure storage
- No sensitive data stored in plain text
- Automatic session management

### 🛡️ Permission System
- Website connection approval required
- Transaction confirmation for all operations
- Clear permission indicators

### 🔐 Private Key Management
- Seeds never leave the extension
- Private keys derived on-demand
- No network transmission of sensitive data

## Development

### Building from K-Swap Components

This extension extracts core wallet functionality from the K-Swap DEX project:

```bash
# The following components were adapted:
# - src/lib/kswap-client.ts → src/lib/wallet-client.ts
# - src/components/WalletConnector.tsx → src/popup/popup.js
# - src/components/TokenSelector.tsx → Token management in popup
# - src/types/index.ts → Complete type system
```

### Adding New Features

1. **New Token Operations**: Extend `wallet-client.ts`
2. **UI Improvements**: Modify `popup.html/css/js`
3. **DApp Integration**: Update `inject.js` and `service-worker.js`

### Testing

```bash
# Run linting
npm run lint

# Build extension
npm run build

# Package for distribution
npm run package
```

## Compatibility

### Supported Networks
- ✅ Keeta Testnet
- ✅ Keeta Mainnet
- ✅ Network switching

### Supported Browsers
- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ⏳ Firefox (planned)

### Supported DApps
- ✅ K-Swap DEX
- ✅ Any DApp using `window.keeta` provider
- ✅ Web3-style integration pattern

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **K-Swap DEX Project**: Core wallet functionality extracted from K-Swap
- **Keeta Network**: Blockchain infrastructure and SDK
- **Chrome Extensions**: Platform and development tools

## Support

- **Issues**: [GitHub Issues](https://github.com/KSwapOrg/KSwapExtension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KSwapOrg/KSwapExtension/discussions)
- **K-Swap Discord**: Community support and development chat

---

**Built with ❤️ by the KSwap Organization**