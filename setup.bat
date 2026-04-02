@echo off
REM Quick setup script for Spotify Wrapped Backend (Windows)

echo 🎵 Setting up Spotify Auth Backend
echo.

REM Check if in root directory
if not exist "package.json" (
    echo Error: Run this script from the root project directory
    exit /b 1
)

echo 1️⃣  Installing backend dependencies...
cd server
call npm install
cd ..

echo.
echo 2️⃣  Creating environment files...

if not exist "server\.env" (
    echo Creating server\.env from template...
    copy server\.env.example server\.env
    echo ⚠️  UPDATE server\.env with your Spotify credentials:
    echo    - Get CLIENT_ID and CLIENT_SECRET from https://developer.spotify.com/dashboard
) else (
    echo ✅ server\.env already exists
)

if not exist ".env.local" (
    echo Creating .env.local from template...
    copy .env.local.example .env.local
    echo ✅ Created .env.local
) else (
    echo ✅ .env.local already exists
)

echo.
echo 3️⃣  Setup complete!
echo.
echo Next steps:
echo 1. Update server\.env with your Spotify credentials
echo 2. In terminal 1, run: cd server ^&^& npm run dev
echo 3. In terminal 2, run: npm start
echo.
echo The app will be available at http://localhost:3000
echo Backend will be at http://localhost:3001
pause
