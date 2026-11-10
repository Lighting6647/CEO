import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectTechStackFromHtml,
  extractApiEndpointsFromHtml,
  buildSecurityAuditInsights,
  generateReconstructionSpec,
  analyzeTargetWebapp,
  formatSpeechSummary,
} from '../src/services/reaAuditService.js';

test('REA Audit: correctly identifies Next.js, Tailwind, and Server headers from HTML', () => {
  const sampleHtml = `
    <html>
      <body class="flex flex-col bg-slate-900 text-white font-sans p-4">
        <div id="__next">
          <script src="/_next/static/chunks/main.js"></script>
        </div>
      </body>
    </html>
  `;
  const headers = { server: 'Vercel / Cloudflare' };
  const stack = detectTechStackFromHtml(sampleHtml, headers);

  assert.ok(stack.some((s) => s.name === 'Next.js'));
  assert.ok(stack.some((s) => s.name === 'Tailwind CSS'));
  assert.ok(stack.some((s) => s.name.includes('Server: Vercel')));
});

test('REA Audit: builds security audit insights accurately', () => {
  const headers = {
    'content-security-policy': "default-src 'self'",
    'strict-transport-security': 'max-age=31536000',
  };
  const security = buildSecurityAuditInsights(headers);
  assert.equal(security.length, 4);
  assert.equal(security[0].status, 'Protected');
});

test('REA Audit: extracts discovered REST/API routes accurately', () => {
  const html = `
    const fetchAuth = () => fetch('/api/v1/auth/login');
    const loadData = () => fetch('/api/v2/analytics/stream');
  `;
  const apis = extractApiEndpointsFromHtml(html);
  assert.equal(apis.length, 2);
  assert.equal(apis[0].endpoint, '/api/v1/auth/login');
  assert.equal(apis[1].endpoint, '/api/v2/analytics/stream');
});

test('REA Audit: generates complete, structured Markdown Reconstruction Spec', () => {
  const auditData = {
    target: 'https://example.com',
    timestamp: '2/11/2026, 22:40:00',
    stack: [
      { name: 'Next.js', category: 'Framework', confidence: '99%' },
      { name: 'Tailwind CSS', category: 'UI / Styling', confidence: '96%' },
    ],
    apis: [{ method: 'GET', endpoint: '/api/v1/session', purpose: 'Auth Clearance' }],
    security: [{ gate: 'HSTS', status: 'Protected', grade: 'A+' }],
  };

  const spec = generateReconstructionSpec(auditData);
  assert.ok(spec.includes('# 🔬 REA Reverse Engineering Architecture Spec'));
  assert.ok(spec.includes('https://example.com'));
  assert.ok(spec.includes('Next.js'));
  assert.ok(spec.includes('/api/v1/session'));
  assert.ok(spec.includes('Zero-AI-Slop Reconstruction Plan'));
});

test('REA Audit: analyzeTargetWebapp handles simulation and speech summary', async () => {
  const result = await analyzeTargetWebapp('https://example.com');
  assert.ok(result.target.includes('example.com'));
  assert.ok(result.stack.length > 0);
  assert.ok(result.markdownSpec.length > 50);

  const speech = formatSpeechSummary(result, 'sir ไลท์');
  assert.ok(speech.includes('sir ไลท์'));
  assert.ok(speech.includes('REA'));
});
