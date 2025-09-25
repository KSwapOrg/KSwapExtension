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

# Copy dependencies (if available)
if [ -d "node_modules" ]; then
    echo "📦 Copying dependencies..."
    mkdir -p build/node_modules
    cp -r node_modules/@keetanetwork build/node_modules/ 2>/dev/null || echo "⚠️  Keeta SDK not found - run 'npm install' first"
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
