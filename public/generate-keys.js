function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function chunkString(value, length) {
  return value.match(new RegExp(`.{1,${length}}`, 'g')).join('\n');
}

document.getElementById('generateKeys').addEventListener('click', async () => {
  const pair = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt'],
  );
  const publicKeyBase64 = arrayBufferToBase64(await crypto.subtle.exportKey('spki', pair.publicKey));
  const privateKeyBase64 = arrayBufferToBase64(await crypto.subtle.exportKey('pkcs8', pair.privateKey));

  document.getElementById('result').style.display = 'block';
  document.getElementById('publicKeyPem').textContent = `-----BEGIN PUBLIC KEY-----\n${chunkString(publicKeyBase64, 64)}\n-----END PUBLIC KEY-----`;
  document.getElementById('privateKeyPem').textContent = `-----BEGIN PRIVATE KEY-----\n${chunkString(privateKeyBase64, 64)}\n-----END PRIVATE KEY-----`;
  document.getElementById('publicKeyBase64').textContent = publicKeyBase64;
  document.getElementById('privateKeyBase64').textContent = privateKeyBase64;
  document.getElementById('envConfig').textContent = `RSA_PUBLIC_KEY=${publicKeyBase64}\nRSA_PRIVATE_KEY=${privateKeyBase64}`;
});

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
    alert('已复制到剪贴板！');
  });
}
