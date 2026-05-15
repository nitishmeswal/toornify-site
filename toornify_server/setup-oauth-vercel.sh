#!/bin/bash

# Vercel Environment Variables Setup Script for OAuth
# Run this after getting your OAuth credentials

echo "🔧 Setting up OAuth Environment Variables on Vercel..."
echo ""
echo "⚠️  Before running this script, make sure you have:"
echo "1. Google Client Secret from: https://console.cloud.google.com/"
echo "2. Discord Client Secret from: https://discord.com/developers/applications"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📝 Please enter your OAuth credentials:"
echo ""

# Google OAuth
read -p "Google Client ID (press Enter to use: 681164953288-0s87jrb2rrvmv0uv36bh10c2ciu546me.apps.googleusercontent.com): " GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-"681164953288-0s87jrb2rrvmv0uv36bh10c2ciu546me.apps.googleusercontent.com"}

read -sp "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Discord OAuth
read -p "Discord Client ID (press Enter to use: 1413402774544191568): " DISCORD_CLIENT_ID
DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID:-"1413402774544191568"}

read -sp "Discord Client Secret: " DISCORD_CLIENT_SECRET
echo ""

# Frontend URL
read -p "Frontend URL (press Enter to use: http://localhost:5173): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:5173"}

echo ""
echo "🚀 Setting environment variables on Vercel..."

# Set Google OAuth variables
vercel env add GOOGLE_CLIENT_ID production <<< "$GOOGLE_CLIENT_ID"
vercel env add GOOGLE_CLIENT_SECRET production <<< "$GOOGLE_CLIENT_SECRET"
vercel env add GOOGLE_CALLBACK_URL production <<< "https://toornify-server.vercel.app/api/v1/auth/google/callback"

# Set Discord OAuth variables
vercel env add DISCORD_CLIENT_ID production <<< "$DISCORD_CLIENT_ID"
vercel env add DISCORD_CLIENT_SECRET production <<< "$DISCORD_CLIENT_SECRET"
vercel env add DISCORD_CALLBACK_URL production <<< "https://toornify-server.vercel.app/api/v1/auth/discord/callback"

# Set Frontend URL
vercel env add FRONTEND_URL production <<< "$FRONTEND_URL/auth/callback"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "⚠️  IMPORTANT: You must now:"
echo "1. Register these callback URLs in your OAuth provider consoles:"
echo "   - Google: https://toornify-server.vercel.app/api/v1/auth/google/callback"
echo "   - Discord: https://toornify-server.vercel.app/api/v1/auth/discord/callback"
echo ""
echo "2. Redeploy your application:"
echo "   vercel --prod"
echo ""
echo "3. Test the OAuth flow:"
echo "   https://toornify-server.vercel.app/api/v1/auth/methods"
echo ""

