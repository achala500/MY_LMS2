import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = 'c:/Users/alwis/Documents/antigravity/dazzling-bardeen';
const pagesDir = path.join(projectRoot, 'src/pages');
const appFile = path.join(pagesDir, '_app.tsx');
const errorFile = path.join(pagesDir, '_error.tsx');

console.log('--- Testing Clean Build with src/pages fallback ---');

// 1. Create src/pages if not exists
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

fs.writeFileSync(appFile, `import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
`);

fs.writeFileSync(errorFile, `import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statusCode ? \`\${statusCode}\` : 'Error'}</h1>
        <p style={{ color: '#94a3b8' }}>{statusCode === 404 ? 'Page Not Found' : 'An unexpected error occurred'}</p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
`);

// 2. Clean .next and out
const nextDir = path.join(projectRoot, '.next');
const outDir = path.join(projectRoot, 'out');
console.log('Cleaning .next and out directories...');
fs.rmSync(nextDir, { recursive: true, force: true });
fs.rmSync(outDir, { recursive: true, force: true });

// 3. Run next build
console.log('Running npx next build...');
const buildRes = spawnSync('npx', ['next', 'build'], {
  cwd: projectRoot,
  shell: true,
  stdio: 'inherit',
  env: process.env,
});

console.log('Build status:', buildRes.status);

// 4. Verify out/ directory contents
if (fs.existsSync(outDir)) {
  const files = fs.readdirSync(outDir);
  console.log('out/ contents (' + files.length + ' items):', files);
} else {
  console.error('out/ directory does NOT exist!');
}
