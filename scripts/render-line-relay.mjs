import http from 'node:http';

const PORT = Number(process.env.PORT || 10000);
const RELAY_SECRET = process.env.LINE_RELAY_SECRET || '';

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (reqUrl.pathname === '/' || reqUrl.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, service: 'line-relay' }));
    }

    if (RELAY_SECRET) {
      const provided = req.headers['x-relay-secret'];
      if (!provided || provided !== RELAY_SECRET) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Unauthorized' }));
      }
    }

    const targetPath = reqUrl.searchParams.get('path') || reqUrl.pathname;
    if (!targetPath.startsWith('/v2/') && !targetPath.startsWith('/oauth2/')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'Invalid LINE API path' }));
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const headers = {};
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];

    const method = req.method || 'GET';
    const hasBody = method !== 'GET' && method !== 'HEAD' && rawBody.length > 0;

    const upstream = await fetch(`https://api.line.me${targetPath}`, {
      method,
      headers,
      body: hasBody ? rawBody : undefined
    });

    const text = await upstream.text();
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json'
    });
    return res.end(text);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: false, error: err?.message || 'Relay error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`LINE Relay listening on port ${PORT}`);
});
