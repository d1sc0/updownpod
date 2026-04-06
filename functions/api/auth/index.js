const { onRequest } = require('firebase-functions/v2/https');
const { defineJsonSecret } = require('firebase-functions/params');
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());

// Use RUNTIME_CONFIG secret
const runtimeConfig = defineJsonSecret('RUNTIME_CONFIG');

// Helper to get config values
function getConfig() {
  return runtimeConfig.value().decap;
}

// Exchange code for access token
app.post('/token', async (req, res) => {
  const code = req.query.code;
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy GitHub API requests
app.use('/', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  try {
    const { jwt_secret } = getConfig();
    const { access_token } = jwt.verify(
      auth.replace('Bearer ', ''),
      jwt_secret,
    );
    const githubRes = await axios({
      method: req.method,
      url: `https://api.github.com${req.url}`,
      headers: {
        Authorization: `token ${access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      data: req.body,
    });
    res.status(githubRes.status).json(githubRes.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

exports['api-auth'] = onRequest({ secrets: [runtimeConfig] }, app);
