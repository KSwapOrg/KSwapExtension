#!/bin/bash

# Keeta Wallet Extension Build Script

echo "🚀 Building Keeta Wallet Extension..."

# Create build directory
mkdir -p build

# Copy extension files to build directory
echo "📁 Copying extension files..."
cp manifest.json build/
cp -r src build/

# Create icons directory and copy ONLY optimized icons
echo "🎨 Setting up optimized icons..."
mkdir -p build/icons
cp icons/icon16-optimized.png build/icons/icon16.png
cp icons/icon32-optimized.png build/icons/icon32.png
cp icons/icon48-optimized.png build/icons/icon48.png
cp icons/icon128-optimized.png build/icons/icon128.png
cp icons/icon128-optimized.png build/icons/KSwapLogo.png

# Copy KeetaNet SDK to lib folder (avoid node_modules in zip)
if [ -f "node_modules/@keetanetwork/keetanet-client/client/index-browser.js" ]; then
    echo "📦 Copying KeetaNet SDK..."
    cp node_modules/@keetanetwork/keetanet-client/client/index-browser.js build/src/lib/keetanet-browser.js
    echo "✅ KeetaNet SDK copied to src/lib/"
else
    echo "⚠️  Keeta SDK not found - run 'npm install' first"
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
