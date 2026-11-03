import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, webcrypto } from 'node:crypto';
import { onRequest } from '../functions/[[path]].js';

const totpSecret = 'JBSWY3DPEHPK3PXP';
const repoToken = 'TEST_REPOSITORY_TOKEN';
const publicImages = [];
const settings = {
  repositories: [{ id: 'private', owner: 'owner', repo: 'images', path: 'images', branch: 'main', token: repoToken, isPublic: false }],
  totp: { enable: true, secret: totpSecret },
};

const pair = await webcrypto.subtle.generateKey(
  { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['encrypt', 'decrypt'],
);
const env = {
  ADMIN_PASSWORD: 'TEST_ADMIN_PASSWORD',
  GITHUB_TOKEN: 'TEST_GLOBAL_TOKEN',
  RSA_PUBLIC_KEY: Buffer.from(await webcrypto.subtle.exportKey('spki', pair.publicKey)).toString('base64'),
  RSA_PRIVATE_KEY: Buffer.from(await webcrypto.subtle.exportKey('pkcs8', pair.privateKey)).toString('base64'),
  KV: {
    get: async (key) => key === 'site_settings' ? settings : key === 'public_images' ? publicImages : null,
    put: async (key, value) => { if (key === 'site_settings') Object.assign(settings, JSON.parse(value)); },
  },
  ASSETS: { fetch: async () => new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } }) },
};

function request(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('CF-Connecting-IP', '192.0.2.55');
  return onRequest({ request: new Request(`https://example.invalid${path}`, { ...options, headers }), env });
}

function totpCode() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of totpSecret) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(Math.floor(Date.now() / 30000), 4);
  const digest = createHmac('sha1', Buffer.from(bytes)).update(counter).digest();
  const offset = digest.at(-1) & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
}

test('settings and private previews reject anonymous requests', async () => {
  assert.equal((await request('/api/settings')).status, 401);
  assert.equal((await request('/api/preview/secret.png?repoId=private')).status, 401);
  assert.equal((await request('/api/preview/payload.html?repoId=private')).status, 400);
});

test('static scripts are restricted and random origin checks fail closed', async () => {
  const page = await request('/');
  assert.match(page.headers.get('content-security-policy'), /script-src 'self'/);
  settings.allowRandom = true;
  settings.randomAllowedHosts = 'allowed.example';
  try {
    assert.equal((await request('/api/random')).status, 403);
  } finally {
    settings.allowRandom = false;
    settings.randomAllowedHosts = '*';
  }
});

test('TOTP is enforced before a signed session is issued', async () => {
  const encrypted = Buffer.from(await webcrypto.subtle.encrypt(
    { name: 'RSA-OAEP' }, pair.publicKey, new TextEncoder().encode(env.ADMIN_PASSWORD),
  )).toString('base64');
  const login = (code) => request('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: encrypted, totpCode: code }),
  });

  const first = await login();
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { valid: true, totpRequired: true });
  assert.equal(first.headers.get('set-cookie'), null);
  assert.equal((await login('invalid')).status, 401);

  const forged = Buffer.from(await webcrypto.subtle.encrypt(
    { name: 'RSA-OAEP' }, pair.publicKey, new TextEncoder().encode(`${env.ADMIN_PASSWORD}:${Date.now()}`),
  )).toString('base64');
  assert.equal((await request('/api/verifyLogin', { method: 'POST', headers: { Authorization: `Bearer ${forged}` } })).status, 401);

  const success = await login(totpCode());
  assert.equal(success.status, 200);
  const { token } = await success.json();
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.equal((await request('/api/verifyLogin', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })).status, 200);

  const configured = await request('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(configured.status, 200);
  const body = await configured.json();
  assert.equal(body.repositories[0].token, '');
  assert.equal(body.repositories[0].hasToken, true);
  assert.equal(body.totp.secret, undefined);

  const updated = await request('/api/settings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteTitle: 'Safe title', repositories: [{ ...body.repositories[0], token: '' }], totp: { enable: true, secret: '' } }),
  });
  assert.equal(updated.status, 200);
  assert.equal(settings.repositories[0].token, repoToken);
  assert.equal(settings.totp.secret, totpSecret);

  const calls = [];
  const originalFetch = globalThis.fetch;
  let actualPrivate = true;
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), auth: options?.headers?.Authorization });
    if (String(url) === 'https://api.github.com/repos/owner/images') {
      return Response.json({ private: actualPrivate });
    }
    if (options?.method === 'PUT') return Response.json({}, { status: 201 });
    return String(url).startsWith('https://api.github.com/')
      ? Response.json({ type: 'file', download_url: 'https://raw.githubusercontent.com/owner/images/main/images/secret.png' })
      : new Response('PRIVATE_IMAGE', { headers: { 'Content-Type': 'image/png' } });
  };
  try {
    const cookie = success.headers.get('set-cookie').split(';')[0];
    const preview = await request('/api/preview/secret.png?repoId=private', { headers: { Cookie: cookie } });
    assert.equal(preview.status, 200);
    assert.equal(preview.headers.get('cache-control'), 'private, no-store');
    assert.equal(preview.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(await preview.text(), 'PRIVATE_IMAGE');
    assert.equal(calls.length, 2);
    assert.ok(calls.every((call) => call.auth === `token ${repoToken}`));

    publicImages.push({ name: 'public.png', repoId: 'private' });
    assert.equal((await request('/api/preview/public.png?repoId=private')).status, 200);
    assert.equal((await request('/api/preview/public.png?repoId=other')).status, 401);
    publicImages.length = 0;

    settings.repositories[0].isPublic = true;
    const form = new FormData();
    form.set('image', new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }), 'sample.png');
    form.set('repoId', 'private');
    const upload = await request('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    assert.equal(upload.status, 200);
    assert.equal((await upload.json()).public, false);

    actualPrivate = false;
    const publicRepoForm = new FormData();
    publicRepoForm.set('image', new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }), 'sample.png');
    publicRepoForm.set('repoId', 'private');
    const rejected = await request('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: publicRepoForm });
    assert.equal(rejected.status, 400);
    assert.equal((await rejected.json()).error, 'privateImageRequiresPrivateRepo');

    actualPrivate = null;
    const unknownRepoForm = new FormData();
    unknownRepoForm.set('image', new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }), 'sample.png');
    unknownRepoForm.set('repoId', 'private');
    const unknown = await request('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: unknownRepoForm });
    assert.equal(unknown.status, 400);
    assert.equal((await unknown.json()).error, 'repoVisibilityCheckFailed');
  } finally {
    settings.repositories[0].isPublic = false;
    publicImages.length = 0;
    globalThis.fetch = originalFetch;
  }
});
