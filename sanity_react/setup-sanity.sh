#!/bin/bash

# Sanity Studio Quick Setup Script
# This script helps you set up a Sanity Studio for your Toornify project

echo "🚀 Sanity Studio Setup for Toornify"
echo "===================================="
echo ""

# Check if Sanity CLI is installed
if ! command -v sanity &> /dev/null; then
    echo "📦 Sanity CLI not found. Installing globally..."
    npm install -g @sanity/cli
    echo "✅ Sanity CLI installed!"
else
    echo "✅ Sanity CLI is already installed"
fi

echo ""
echo "📁 Creating Sanity Studio directory..."
mkdir -p sanity-studio
cd sanity-studio

echo ""
echo "🎨 Initializing Sanity Studio..."
echo "Please follow the prompts:"
echo "  1. Login to Sanity (or create an account)"
echo "  2. Create a new project or select an existing one"
echo "  3. Choose 'production' as your dataset name"
echo "  4. Select 'Clean project with no predefined schemas'"
echo ""

sanity init

echo ""
echo "✅ Sanity Studio initialized!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy the project ID from the output above"
echo "  2. Add it to your .env file: VITE_SANITY_PROJECT_ID=your-project-id"
echo "  3. Run 'npm install' in the sanity-studio directory"
echo "  4. Add the schema files (check SANITY_INTEGRATION.md)"
echo "  5. Run 'sanity dev' to start the studio"
echo ""
echo "📖 For detailed instructions, see SANITY_INTEGRATION.md"
