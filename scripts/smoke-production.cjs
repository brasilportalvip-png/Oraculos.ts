#!/usr/bin/env node

const { spawn } = require('node:child_process');
const path = require('node:path');

async function checkPort3000Active() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/health', { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const is3000Running = await checkPort3000Active();
  let server = null;
  let serverOutput = '';
  const PORT = is3000Running ? 3000 : 3000;
  const baseUrl = `http://127.0.0.1:${PORT}`;

  if (!is3000Running) {
    server = spawn(
      process.execPath,
      [path.resolve(process.cwd(), 'dist/server.cjs')],
      {
        env: {
          ...process.env,
          NODE_ENV: 'production',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    for (const stream of [server.stdout, server.stderr]) {
      stream.on('data', (chunk) => {
        serverOutput += chunk.toString();
      });
    }
  }

  const wait = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });

  async function waitForServer() {
    if (is3000Running) return;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (server && server.exitCode !== null) {
        throw new Error(
          `Servidor encerrou antes do teste.\n${serverOutput}`,
        );
      }

      try {
        const response = await fetch(
          `${baseUrl}/api/health`,
          {
            signal: AbortSignal.timeout(1_000),
          },
        );

        if (response.ok) {
          return;
        }
      } catch {
        // O processo ainda pode estar inicializando.
      }

      await wait(250);
    }

    throw new Error(
      `Servidor não ficou disponível.\n${serverOutput}`,
    );
  }

  try {
    await waitForServer();

    const healthResponse = await fetch(
      `${baseUrl}/api/health`,
      {
        headers: {
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(5_000),
      },
    );

    const health = await healthResponse.json();

    if (
      !healthResponse.ok ||
      health.status !== 'ok' ||
      health.services?.api !== 'ok'
    ) {
      throw new Error(
        'A API do servidor de produção não respondeu corretamente.',
      );
    }

    const pageResponse = await fetch(
      `${baseUrl}/especialistas`,
      {
        headers: {
          accept: 'text/html',
        },
        signal: AbortSignal.timeout(5_000),
      },
    );

    const contentType =
      pageResponse.headers.get('content-type') || '';

    const page = await pageResponse.text();

    if (
      !pageResponse.ok ||
      !contentType.includes('text/html') ||
      !page.includes('<div id="root"></div>')
    ) {
      throw new Error(
        'O frontend SPA não foi servido pelo servidor de produção.',
      );
    }

    console.log(
      `Servidor ${is3000Running ? 'ativo (porta 3000)' : 'de produção'} aprovado: API e frontend SPA operacionais.`,
    );
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM');
    }
  }
}

main().catch((error) => {
  console.error(
    `Smoke test de produção falhou: ${
      error instanceof Error
        ? error.message
        : String(error)
    }`,
  );
  process.exitCode = 1;
});

