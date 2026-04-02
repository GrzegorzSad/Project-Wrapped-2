# Spotify Auth Backend Setup Guide

## What Changed?

Your app now uses the **Spotify Authorization Code Flow** (secure) instead of the deprecated **Implicit Flow**. This requires a backend server to keep your client secret safe.

## Files Created

```
server/
├── index.js           # Express server with OAuth endpoints
├── package.json       # Backend dependencies
├── .env.example       # Template for environment variables
└── README.md          # Detailed backend documentation

.env.local.example     # Frontend environment template
.env.example           # Frontend environment template
setup.bat              # Windows setup script
setup.sh               # Unix setup script
```

## Quick Start

### Option 1: Automatic Setup (Windows)

```bash
setup.bat
```

Or for Mac/Linux:
```bash
bash setup.sh
```

### Option 2: Manual Setup

#### 1. Get Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app or use existing one
3. Copy your **Client ID** and **Client Secret**
4. Add redirect URI: `http://localhost:3001/callback`

#### 2. Configure Backend

Create `server/.env`:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
LOCAL_REDIRECT_URI=http://localhost:3001/callback
PROD_REDIRECT_URI=https://projectwrapped2.web.app/callback
PORT=3001
SESSION_SECRET=my-super-secret-session-key
```

#### 3. Install Dependencies

```bash
cd server
npm install
cd ..
```

#### 4. Configure Frontend

Create `.env.local`:

```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

#### 5. Run Both Servers

**Terminal 1 (Backend)**:
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
npm start
```

## How It Works

1. **Login**: User clicks login → redirects to `/login` endpoint
2. **Spotify Auth**: User authorizes on Spotify → redirected to backend `/callback`
3. **Token Exchange**: Backend exchanges code for access token securely
4. **Frontend Gets Token**: Backend redirects to frontend with token in URL
5. **Refresh**: Token automatically refreshes when expired via backend `/refresh`
6. **Logout**: Session cleared on both backend and frontend

## For Production (Firebase)

### 1. Update Redirect URIs

In `server/.env`:
```env
PROD_REDIRECT_URI=https://your-deployed-url.web.app/callback
```

In Spotify Dashboard, add redirect URI.

### 2. Deploy Backend

With Firebase App Hosting, update `apphosting.yaml`:

```yaml
services:
  - name: frontend
    sourceDir: .
    runtime:
      nodeVersion: 18
      
  - name: backend
    sourceDir: server
    runtime:
      nodeVersion: 18
```

### 3. Update Frontend Env

For production builds, set:
```env
REACT_APP_BACKEND_URL=https://your-backend-url
```

## Troubleshooting

**"Cannot find module" error**:
```bash
cd server && npm install && cd ..
```

**CORS errors**: Make sure frontend URL is added to `corsOptions` in `server/index.js`

**Login redirects to Spotify but doesn't come back**: 
- Check redirect URI matches exactly in `.env` and Spotify Dashboard
- Verify backend is running on port 3001

**Token not saving**: Check localStorage in DevTools → Application → Local Storage

## Key Differences from Old Flow

| Old (Implicit) | New (Authorization Code) |
|---|---|
| Frontend -> Spotify directly | Frontend -> Backend -> Spotify |
| Token in URL hash | Token exchanged securely |
| No refresh capability | Automatic token refresh |
| Client secret exposed (bad) | Client secret safe on backend ✅ |

## Security

✅ Client secret never exposed to frontend
✅ Tokens handled securely
✅ Session-based architecture
✅ HTTPS in production
⚠️  Change `SESSION_SECRET` in production!

## Next Steps

Run `setup.bat` or follow manual steps above, then test the login flow!

Need more details? See `server/README.md`
