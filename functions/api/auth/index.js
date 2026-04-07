const { onRequest } = require('firebase-functions/v2/https');
const { defineJsonSecret } = require('firebase-functions/params');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({ origin: true }));
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
  return {
    github_client_id: config.decap.github_client_id?.trim(),
    github_client_secret: config.decap.github_client_secret?.trim(),
    base_url: config.decap.base_url?.trim(),
  };
}

// Start GitHub OAuth flow for Decap CMS (GET /api/auth)
app.get(['/api/auth', '/api-auth', '/'], (req, res) => {
  try {
    const { github_client_id, base_url } = getConfig();
    const redirect_uri = `${base_url.replace(/\/$/, '')}/api/auth/callback`;
    const site_id = req.query.site_id || '';
    const scope = req.query.scope || 'repo';
    const state = encodeURIComponent(
      req.query.state || Math.random().toString(36).substring(2),
    );

    console.log('--- OAuth Authorize ---', { redirect_uri, state });

    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${encodeURIComponent(github_client_id)}` +
      `&redirect_uri=${redirect_uri}` +
      `&scope=${encodeURIComponent(scope)}` +
      (site_id ? `&site_id=${encodeURIComponent(site_id)}` : '') +
      `&state=${state}`;
    res.redirect(githubAuthUrl);
  } catch (error) {
    res.status(500).send('OAuth setup error: ' + error.message);
  }
});

// Exchange code for access token (POST for Decap, GET for OAuth callback)
app.post(['/api/auth/token', '/api-auth/token', '/token'], async (req, res) => {
  const code = req.body?.code || req.query?.code;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    const { github_client_id, github_client_secret, base_url } = getConfig();
    const redirect_uri = `${base_url.replace(/\/$/, '')}/api/auth/callback`;

    const params = new URLSearchParams();
    params.append('client_id', github_client_id);
    params.append('client_secret', github_client_secret);
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);

    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      params,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Decap-CMS-Auth',
        },
      },
    );
    const access_token = tokenRes.data.access_token;
    if (!access_token) throw new Error('No access token');
    res.json({ token: access_token, provider: 'github' });
  } catch (error) {
    console.error('Auth Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Handle OAuth callback for Decap CMS (GET /callback)
app.get('/api/auth/callback', async (req, res) => {
  const code = req.query?.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    const { github_client_id, github_client_secret, base_url } = getConfig();
    const redirect_uri = `${base_url.replace(/\/$/, '')}/api/auth/callback`;

    console.log('--- /api/auth/callback HIT ---', { code, redirect_uri });

    const params = new URLSearchParams();
    params.append('client_id', github_client_id);
    params.append('client_secret', github_client_secret);
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);

    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      params,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Decap-CMS-Auth',
        },
      },
    );
    const access_token = tokenRes.data.access_token;
    if (!access_token) {
      console.error('No access token. Full GitHub response:', tokenRes.data);
      return res
        .status(400)
        .send(
          'No access token. GitHub response: ' + JSON.stringify(tokenRes.data),
        );
    }

    const responsePayload = {
      token: access_token,
      provider: 'github',
    };

    const script = `
      <script>
        (function() {
          const message = "authorization:github:success:" + JSON.stringify(${JSON.stringify(responsePayload)});
          window.opener.postMessage(message, "*");
          window.close();
        })();
      </script>
    `;
    res.send(`<!DOCTYPE html><html><body>${script}</body></html>`);
  } catch (error) {
    console.error(
      'OAuth Callback Error:',
      error.response?.data || error.message,
    );
    res.status(error.response?.status || 500).send(error.message);
  }
});

// Proxy GitHub API requests (must be last)
app.all('/*', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ error: 'Missing Authorization header' });

  try {
    const access_token = auth.replace('Bearer ', '').replace('token ', '');

    // Strip function name prefix if present (e.g., /api-auth/user -> /user)
    const cleanPath = req.url
      .replace(/^\/api\/auth/, '')
      .replace(/^\/api-auth/, '');

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
