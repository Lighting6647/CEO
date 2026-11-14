/**
 * Vercel Serverless Relay for LINE Messaging API.
 * Forwards authenticated requests from the VPS to https://api.line.me.
 */
export default async function handler(req, res) {
  const expectedSecret = process.env.LINE_RELAY_SECRET;
  if (expectedSecret) {
    const provided = req.headers['x-relay-secret'];
    if (!provided || provided !== expectedSecret) {
      return res.status(401).json({ ok: false, error: 'Unauthorized relay request' });
    }
  }

  const rawPath = typeof req.query?.path === 'string' ? req.query.path : '';
  if (!rawPath || (!rawPath.startsWith('/v2/') && !rawPath.startsWith('/oauth2/'))) {
    return res.status(400).json({ ok: false, error: 'Invalid LINE API path' });
  }

  const targetUrl = `https://api.line.me${rawPath}`;
  const headers = {};
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }

  const method = req.method || 'POST';
  const hasBody = method !== 'GET' && method !== 'HEAD';
  let body;
  if (hasBody && req.body !== undefined && req.body !== null) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body
    });
    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    return res.send(text);
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: 'Relay upstream error',
      message: err?.message || 'Unknown error'
    });
  }
}
