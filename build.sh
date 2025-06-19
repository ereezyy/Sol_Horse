#!/bin/bash

# Sol_Horse Build and Deploy Script
echo "🏇 Building Sol_Horse with Enhanced Features..."

# Clean previous build
rm -rf dist/

# Build the application
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📊 Build stats:"
    ls -la dist/
    echo ""
    echo "🚀 Ready for deployment!"
else
    echo "❌ Build failed!"
    exit 1
fi

