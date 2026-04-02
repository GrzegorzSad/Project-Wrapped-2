import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/.env` });

const app = express();
const PORT = process.env.PORT || 3001;

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const redirectUri = isProduction 
  ? process.env.PROD_REDIRECT_URI 
  : process.env.LOCAL_REDIRECT_URI;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - adjust for your frontend URL
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://projectwrapped2.web.app',
    'https://wrapped2-newwrapped2.web.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Spotify OAuth endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Simple in-memory state store (survives both localhost and IP address access)
const oauthStates = new Map();

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-top-read'
].join(' ');

/**
 * GET /login
 * Redirects user to Spotify authorization page
 */
app.get('/login', (req, res) => {
  const state = Math.random().toString(36).substring(7); // Generate random state
  console.log('🔐 Login initiated. State:', state);

  // Store state in memory (survives localhost/IP address transitions)
  oauthStates.set(state, Date.now());
  
  // Clean up old states (older than 10 minutes)
  for (const [key, timestamp] of oauthStates) {
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      oauthStates.delete(key);
    }
  }

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    state: state,
    show_dialog: 'true'
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
});

/**
 * GET /callback
 * Handles the OAuth2 callback from Spotify
 * Exchanges authorization code for access token
 */
app.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  console.log('🔄 Callback received');
  console.log('🔑 Incoming state:', state);
  console.log('🔑 States in store:', Array.from(oauthStates.keys()));

  // Check for errors
  if (error) {
    console.error("Spotify auth error:", error);
    return res.redirect(`http://localhost:3000?error=${encodeURIComponent(error)}`);
  }

  // Verify state parameter (check if it exists in our store)
  if (!oauthStates.has(state)) {
    console.error('❌ State mismatch! State not found in store:', state);
    return res.status(401).json({ error: 'State parameter mismatch' });
  }

  // Clear the used state
  oauthStates.delete(state);

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    console.log('✅ Token exchange successful');

    // Store tokens in session for future refresh requests
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.expiresAt = Date.now() + expires_in * 1000;

    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`http://localhost:3000/?error=session_error`);
      }

      // Always redirect to localhost in development (even though Spotify redirected to IP)
      const frontendUrl = isProduction 
        ? 'https://projectwrapped2.web.app'
        : 'http://localhost:3000';

      res.redirect(
        `${frontendUrl}/callback?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
      );
    });
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    
    const frontendUrl = isProduction 
      ? 'https://projectwrapped2.web.app'
      : 'http://localhost:3000';
    
    res.redirect(`${frontendUrl}/?error=server_error`);
  }
});

/**
 * POST /refresh
 * Refreshes the access token using refresh token
 */
app.post('/refresh', async (req, res) => {
  const refreshToken = req.session.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token available' });
  }

  try {
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    // Update session
    req.session.accessToken = access_token;
    req.session.expiresAt = Date.now() + expires_in * 1000;

    res.json({
      access_token,
      expires_in
    });
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Token refresh failed',
      details: error.message
    });
  }
});

/**
 * POST /logout
 * Clears session
 */
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

/**
 * GET /session
 * Returns current session info (for frontend to verify auth status)
 */
app.get('/session', (req, res) => {
  if (req.session.accessToken) {
    res.json({
      authenticated: true,
      expiresAt: req.session.expiresAt
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Spotify Auth Backend running on http://localhost:${PORT}`);
  console.log(`Redirect URI: ${redirectUri}`);
});
