#!/bin/bash
# Quick setup script for Spotify Wrapped Backend

echo "🎵 Setting up Spotify Auth Backend"
echo ""

# Check if in root directory
if [ ! -f "package.json" ]; then
    echo "Error: Run this script from the root project directory"
    exit 1
fi

echo "1️⃣  Installing backend dependencies..."
cd server
npm install
cd ..

echo ""
echo "2️⃣  Creating environment files..."

if [ ! -f "server/.env" ]; then
    echo "Creating server/.env from template..."
    cp server/.env.example server/.env
    echo "⚠️  UPDATE server/.env with your Spotify credentials:"
    echo "   - Get CLIENT_ID and CLIENT_SECRET from https://developer.spotify.com/dashboard"
else
    echo "✅ server/.env already exists"
fi

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "3️⃣  Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your Spotify credentials"
echo "2. In terminal 1, run: cd server && npm run dev"
echo "3. In terminal 2, run: npm start"
echo ""
echo "The app will be available at http://localhost:3000"
echo "Backend will be at http://localhost:3001"
