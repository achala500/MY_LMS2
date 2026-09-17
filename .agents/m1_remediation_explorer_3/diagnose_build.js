import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('Testing Next.js build internals...');
const projectRoot = 'c:/Users/alwis/Documents/antigravity/dazzling-bardeen';

const nextBin = path.join(projectRoot, 'node_modules/next/dist/bin/next');
console.log('Next bin path:', nextBin, 'exists:', fs.existsSync(nextBin));

const child = spawn('node', [nextBin, 'build'], {
  cwd: projectRoot,
  env: {
    ...process.env,
    NEXT_PRIVATE_DEBUG_CACHE: '1',
    DEBUG: 'next:*'
  },
  stdio: 'pipe'
});

child.stdout.on('data', (d) => {
  process.stdout.write(d);
});

child.stderr.on('data', (d) => {
  process.stderr.write(d);
});

child.on('close', (code) => {
  console.log('Build child process exited with code:', code);
});
