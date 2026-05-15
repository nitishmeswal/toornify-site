#!/bin/bash

# Discord OAuth Test Script
# This script helps you test your Discord OAuth configuration

echo "🔍 Discord OAuth Configuration Checker"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "   Create a .env file first"
    exit 1
fi

# Load environment variables
source .env

# Check Discord Client ID
if [ -z "$DISCORD_CLIENT_ID" ]; then
    echo "❌ DISCORD_CLIENT_ID is not set"
else
    echo "✅ DISCORD_CLIENT_ID is set: $DISCORD_CLIENT_ID"
fi

# Check Discord Client Secret
if [ -z "$DISCORD_CLIENT_SECRET" ] || [ "$DISCORD_CLIENT_SECRET" = "YOUR_DISCORD_CLIENT_SECRET_HERE" ]; then
    echo "❌ DISCORD_CLIENT_SECRET is not set or still using placeholder"
    echo "   🔗 Get your secret from: https://discord.com/developers/applications"
else
    echo "✅ DISCORD_CLIENT_SECRET is set (hidden for security)"
fi

# Check Discord Callback URL
if [ -z "$DISCORD_CALLBACK_URL" ]; then
    echo "❌ DISCORD_CALLBACK_URL is not set"
else
    echo "✅ DISCORD_CALLBACK_URL is set: $DISCORD_CALLBACK_URL"
fi

# Check Frontend URL
if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  FRONTEND_URL is not set (will use default)"
else
    echo "✅ FRONTEND_URL is set: $FRONTEND_URL"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="

if [ -z "$DISCORD_CLIENT_SECRET" ] || [ "$DISCORD_CLIENT_SECRET" = "YOUR_DISCORD_CLIENT_SECRET_HERE" ]; then
    echo ""
    echo "1. Go to Discord Developer Portal:"
    echo "   https://discord.com/developers/applications"
    echo ""
    echo "2. Select your application (or create one)"
    echo ""
    echo "3. Go to OAuth2 → General"
    echo ""
    echo "4. Copy the Client Secret"
    echo ""
    echo "5. Add it to your .env file:"
    echo "   DISCORD_CLIENT_SECRET=your_secret_here"
    echo ""
    echo "6. Add these redirect URIs in Discord:"
    echo "   - http://localhost:8002/api/v1/auth/discord/callback"
    echo "   - https://toornify-server.vercel.app/api/v1/auth/discord/callback"
    echo ""
else
    echo ""
    echo "✅ Configuration looks good!"
    echo ""
    echo "Test your Discord OAuth by visiting:"
    echo "📍 http://localhost:8002/api/v1/auth/discord"
    echo ""
    echo "Or test with custom redirect:"
    echo "📍 http://localhost:8002/api/v1/auth/discord?redirect_uri=http://localhost:5173/auth/callback"
    echo ""
fi

echo ""
echo "📚 Read DISCORD-OAUTH-SETUP.md for detailed instructions"

