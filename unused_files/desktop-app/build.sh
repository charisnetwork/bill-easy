#!/bin/bash
# Build script for Bill Easy Desktop

echo "=========================================="
echo "Building Bill Easy Desktop App"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found. Please install Rust from https://rustup.rs/"
    exit 1
fi

echo "✅ Prerequisites OK"

# Install dependencies
echo ""
echo "Installing npm dependencies..."
npm install

# Build the app
echo ""
echo "Building Tauri app..."
npm run tauri:build

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo ""
echo "Installer location:"
echo "  src-tauri/target/release/bundle/nsis/Bill-Easy_2.0.0_x64-setup.exe"
echo ""
echo "Portable executable:"
echo "  src-tauri/target/release/bundle/msi/Bill-Easy_2.0.0_x64_en-US.msi"
echo ""
