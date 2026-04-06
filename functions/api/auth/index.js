const { onRequest } = require('firebase-functions/v2/https');
const { defineJsonSecret } = require('firebase-functions/params');
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Use RUNTIME_CONFIG secret
const runtimeConfig = defineJsonSecret('RUNTIME_CONFIG');

// Helper to get config values
function getConfig() {
  const config = runtimeConfig.value();
  if (!config || !config.decap) {
    throw new Error(
      'RUNTIME_CONFIG secret is missing or missing the "decap" key',
    );
  }
  return config.decap;
}

// Exchange code for access token (POST for Decap, GET for OAuth callback)
app.post(['/token', '/api-auth/token'], async (req, res) => {
  const code = req.body?.code || req.query?.code;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    const { github_client_id, github_client_secret, jwt_secret } = getConfig();
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: github_client_id,
        client_secret: github_client_secret,
        code,
      },
      { headers: { Accept: 'application/json' } },
    );
    const access_token = tokenRes.data.access_token;
    if (!access_token) throw new Error('No access token');
    const jwtToken = jwt.sign({ access_token }, jwt_secret, {
      expiresIn: '1h',
    });
    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Auth Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Handle OAuth callback for Decap CMS (GET /callback)
app.get(['/callback', '/api-auth/callback'], async (req, res) => {
  const code = req.query?.code;
  if (!code) return res.status(400).send('Missing code');
  try {
    const { github_client_id, github_client_secret, jwt_secret } = getConfig();
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: github_client_id,
        client_secret: github_client_secret,
        code,
      },
      { headers: { Accept: 'application/json' } },
    );
    const access_token = tokenRes.data.access_token;
    if (!access_token) throw new Error('No access token');
    const jwtToken = jwt.sign({ access_token }, jwt_secret, {
      expiresIn: '1h',
    });
    // Redirect back to Decap CMS with the token in the URL fragment
    const site = req.query?.site_id || '';
    const redirectUrl = `${site || '/admin'}/#/auth/callback?token=${jwtToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error(
      'OAuth Callback Error:',
      error.response?.data || error.message,
    );
    res.status(error.response?.status || 500).send(error.message);
  }
});

// Proxy GitHub API requests
app.all('/*', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  try {
    const { jwt_secret } = getConfig();
    const { access_token } = jwt.verify(
      auth.replace('Bearer ', ''),
      jwt_secret,
    );

    // Strip function name prefix if present (e.g., /api-auth/user -> /user)
    const cleanPath = req.url.replace(/^\/api-auth/, '');

    const githubRes = await axios({
      method: req.method,
      url: `https://api.github.com${cleanPath}`,
      headers: {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      data: ['GET', 'DELETE', 'HEAD'].includes(req.method)
        ? undefined
        : req.body,
    });
    res.status(githubRes.status).json(githubRes.data);
  } catch (error) {
    console.error('Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

module.exports = onRequest({ secrets: [runtimeConfig] }, app);
