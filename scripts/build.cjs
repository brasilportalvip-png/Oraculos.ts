#!/usr/bin/env node

const {
  build: buildBackend,
} = require('esbuild');

async function run() {
  const {
    build: buildFrontend,
  } = await import('vite');

  await buildFrontend({
    build: {
      outDir: 'dist/public',
    },
  });

  await buildBackend({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    sourcemap: true,
    outfile: 'dist/server.cjs',
  });

  await buildBackend({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    define: {
      'process.env.VERCEL':
        JSON.stringify('1'),
      'process.env.NODE_ENV':
        JSON.stringify('production'),
    },
    outfile: 'dist/serverless.cjs',
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
