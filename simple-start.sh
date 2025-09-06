#!/bin/bash

echo "🚀 Starting Everyday Properties (Simple Mode)"
echo ""

# Sync environment variables first
echo "🔄 Syncing environment variables..."
./sync-env.sh

echo ""
echo "🏗️  Starting development server..."
echo "   This may take a moment to compile..."
echo ""

# Try different approaches to start the server
cd apps/app

# Method 1: Try with Node directly
echo "🔧 Attempting to start Next.js server..."
if command -v node >/dev/null 2>&1; then
    # Set environment variables explicitly
    export NODE_ENV=development
    export NEXT_TELEMETRY_DISABLED=1
    
    # Try to start with node directly
    node_modules/.bin/next dev -p 3000 2>/dev/null || \
    npx --yes next@latest dev -p 3000 2>/dev/null || \
    npm run dev 2>/dev/null || \
    echo "❌ Could not start development server"
else
    echo "❌ Node.js not found"
fi
