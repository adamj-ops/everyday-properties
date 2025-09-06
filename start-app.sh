#!/bin/bash

echo "🚀 Starting Everyday Properties App..."
echo ""

# Check if Clerk keys are set
if grep -q "REPLACE_WITH_YOUR_ACTUAL_CLERK" .env; then
    echo "❌ Please update your Clerk keys in the root .env file first!"
    echo "   Edit the .env file and replace:"
    echo "   CLERK_SECRET_KEY=\"sk_test_REPLACE_WITH_YOUR_ACTUAL_CLERK_SECRET_KEY\""
    echo "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"pk_test_REPLACE_WITH_YOUR_ACTUAL_CLERK_PUBLISHABLE_KEY\""
    echo ""
    echo "   Then run ./sync-env.sh to sync the keys"
    exit 1
fi

echo "✅ Environment variables look good!"
echo "🔄 Syncing environment variables..."
./sync-env.sh

echo ""
echo "🏗️  Starting Next.js development server..."
echo "   App will be available at: http://localhost:3000"
echo ""

# Start the app with proper environment
cd apps/app
NODE_ENV=development npx next dev -p 3000
