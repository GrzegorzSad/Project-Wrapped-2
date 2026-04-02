# Spotify Auth Backend

A minimal Node.js/Express backend for handling Spotify OAuth2 authorization code flow.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory (or copy from `.env.example`):

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
LOCAL_REDIRECT_URI=http://localhost:3001/callback
PROD_REDIRECT_URI=https://projectwrapped2.web.app/callback
PORT=3001
SESSION_SECRET=generate_a_random_string_here
```

**Important:** Get your credentials from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

### 3. Update Frontend Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

For production, update to your deployed backend URL.

### 4. Run Locally

```bash
# Backend (from server directory)
npm run dev

# Frontend (from root directory, in another terminal)
npm start
```

## API Endpoints

### `GET /login`
Redirects user to Spotify authorization page.

### `GET /callback`
Handles OAuth callback from Spotify. Exchanges authorization code for access token and redirects to frontend.

### `POST /refresh`
Refreshes the access token using stored refresh token.

**Request**: Requires valid session cookie
**Response**:
```json
{
  "access_token": "...",
  "expires_in": 3600
}
```

### `POST /logout`
Clears user session.

### `GET /session`
Returns authentication status.

**Response**:
```json
{
  "authenticated": true,
  "expiresAt": 1234567890
}
```

### `GET /health`
Health check endpoint.

## Deployment

### Firebase App Hosting
1. Ensure backend dependencies are in `server/package.json`
2. Update `apphosting.yaml` to include a service for the backend:

```yaml
services:
  - name: backend
    sourceDir: server
    runtime:
      nodeVersion: 18
```

3. Update redirect URIs in `.env` for production domain
4. Deploy with Firebase CLI

### Alternative Hosting (Heroku, Render, etc.)
1. Set environment variables in hosting platform
2. Ensure `NODE_ENV=production` is set
3. Update frontend `REACT_APP_BACKEND_URL` to point to deployed backend

## Security Notes

- ✅ Client secret is never exposed to frontend
- ✅ Refresh token stored securely in HTTP-only session cookie
- ✅ CORS configured for specific domains
- ✅ State parameter validates OAuth flow integrity
- ⚠️ Change `SESSION_SECRET` in production
- ⚠️ Use HTTPS in production (`secure: true` in session cookie)

## Troubleshooting

**"State parameter mismatch"**: Clear browser cookies and try again

**"Token exchange error"**: Verify credentials and redirect URIs match exactly in Spotify Dashboard

**CORS errors**: Check that frontend URL is in `corsOptions.origin` array in `index.js`

## Next Steps

- Token refresh happens automatically when frontend detects expiry
- Consider implementing a task queue for Spotify API calls if rate limiting is an issue
- Add proper error handling UI in the login/callback pages
