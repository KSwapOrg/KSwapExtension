#!/bin/bash

# Keeta Wallet Extension Build Script

echo "🚀 Building Keeta Wallet Extension..."

# Create build directory
mkdir -p build

# Copy extension files to build directory
echo "📁 Copying extension files..."
cp manifest.json build/
cp -r src build/
cp -r icons build/

# Use KSwap logo for all icon sizes
echo "🎨 Setting up icons..."
cp icons/KSwapLogo.png build/icons/icon16.png
cp icons/KSwapLogo.png build/icons/icon32.png
cp icons/KSwapLogo.png build/icons/icon48.png
cp icons/KSwapLogo.png build/icons/icon128.png

# Copy dependencies (if available)
if [ -d "node_modules" ]; then
    echo "📦 Copying dependencies..."
    mkdir -p build/node_modules/@keetanetwork/keetanet-client/client
    cp node_modules/@keetanetwork/keetanet-client/client/index-browser.js build/node_modules/@keetanetwork/keetanet-client/client/ 2>/dev/null || echo "⚠️  Keeta SDK not found - run 'npm install' first"
    echo "✅ KeetaNet browser SDK copied"
fi

echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (top right)"
echo "3. Click 'Load unpacked' and select the 'build' directory"
echo "4. The Keeta Wallet icon should appear in your extensions bar"
echo ""
echo "🔗 To test with K-Swap:"
echo "1. Make sure K-Swap is running on http://localhost:3001"
echo "2. The extension will automatically inject the wallet provider"
echo "3. K-Swap should detect the wallet and allow connection"
