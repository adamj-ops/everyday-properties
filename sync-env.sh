#!/bin/bash

# Environment Sync Script for Everyday Properties
# This script copies the root .env file to all necessary locations

echo "🔄 Syncing environment variables..."

# Copy root .env to all necessary locations
cp .env packages/database/.env
cp .env apps/app/.env.local
cp .env apps/api/.env.local
cp .env apps/web/.env.local

echo "✅ Environment variables synced to all locations:"
echo "   - packages/database/.env"
echo "   - apps/app/.env.local"
echo "   - apps/api/.env.local"
echo "   - apps/web/.env.local"
echo ""
echo "💡 Now edit the root .env file with your actual Clerk keys and run this script again to sync."
