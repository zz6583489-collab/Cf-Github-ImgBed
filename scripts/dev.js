import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = path.join(root, 'node_modules/vite/bin/vite.js');
const wrangler = path.join(root, 'node_modules/wrangler/bin/wrangler.js');

const initial = spawnSync(process.execPath, [vite, 'build'], { cwd: root, stdio: 'inherit' });
if (initial.status !== 0) process.exit(initial.status || 1);

const children = [
  spawn(process.execPath, [vite, 'build', '--watch'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, [wrangler, 'pages', 'dev', 'dist'], { cwd: root, stdio: 'inherit' }),
];

function stop(code = 0) {
  for (const child of children) child.kill();
  process.exit(code);
}

for (const child of children) {
  child.on('error', (error) => { console.error(error); stop(1); });
  child.on('exit', (code) => stop(code || 0));
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
