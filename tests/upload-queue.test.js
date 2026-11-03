import test from 'node:test';
import assert from 'node:assert/strict';
import { UploadQueue } from '../src/utils/uploadQueue.js';

test('upload queue sends the selected repository and preserves a 400 error code', async () => {
  const originalXHR = globalThis.XMLHttpRequest;
  let sentRepoId;

  globalThis.XMLHttpRequest = class {
    static DONE = 4;
    upload = {};
    open() {}
    setRequestHeader() {}
    send(formData) {
      sentRepoId = formData.get('repoId');
      this.readyState = 4;
      this.status = 400;
      this.responseText = JSON.stringify({ error: 'privateImageRequiresPrivateRepo' });
      queueMicrotask(() => this.onreadystatechange());
    }
    abort() {}
  };

  try {
    const queue = new UploadQueue({ maxRetries: 1 });
    const error = await new Promise((resolve) => {
      queue.add(new File(['image'], 'sample.png', { type: 'image/png' }), {
        token: 'TEST_SESSION',
        repoId: 'private-repo',
        isPublic: false,
        onError: (_id, uploadError) => resolve(uploadError),
      });
    });
    assert.equal(sentRepoId, 'private-repo');
    assert.equal(error.message, 'privateImageRequiresPrivateRepo');
    assert.equal(error.noRetry, true);
  } finally {
    globalThis.XMLHttpRequest = originalXHR;
  }
});
