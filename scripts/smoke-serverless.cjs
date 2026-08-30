#!/usr/bin/env node

process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

const serverModule = require(
  '../dist/serverless.cjs',
);

const app =
  serverModule.default || serverModule;

async function run() {
  const server = app.listen(
    0,
    '127.0.0.1',
  );

  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const address = server.address();

    if (
      !address ||
      typeof address === 'string'
    ) {
      throw new Error(
        'Não foi possível obter a porta do pacote serverless.',
      );
    }

    for (
      const pathname of [
        '/api/health',
        '/api/packages',
      ]
    ) {
      const response = await fetch(
        `http://127.0.0.1:${address.port}${pathname}`,
        {
          headers: {
            accept: 'application/json',
          },
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        throw new Error(
          `${pathname} retornou HTTP ${response.status}.`,
        );
      }

      const body = await response.json();

      if (
        pathname === '/api/health' &&
        (
          body.status !== 'ok' ||
          body.services?.api !== 'ok'
        )
      ) {
        throw new Error(
          '/api/health não declarou a API como operacional.',
        );
      }

      if (
        pathname === '/api/packages' &&
        (
          body.success !== true ||
          !Array.isArray(body.data) ||
          body.data.length === 0
        )
      ) {
        throw new Error(
          '/api/packages não retornou os pacotes oficiais.',
        );
      }
    }

    console.log(
      'Pacote serverless aprovado: health e packages responderam corretamente.',
    );
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
}

run().catch((error) => {
  console.error(
    `Smoke test serverless falhou: ${
      error instanceof Error
        ? error.message
        : String(error)
    }`,
  );
  process.exit(1);
});
