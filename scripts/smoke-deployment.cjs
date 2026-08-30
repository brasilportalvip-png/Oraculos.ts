#!/usr/bin/env node

const baseUrl = String(
  process.argv[2] ||
  process.env.DEPLOYMENT_URL ||
  '',
)
  .trim()
  .replace(/\/$/, '');

if (!baseUrl) {
  console.error(
    'Uso: npm run smoke:deployment -- https://seu-deployment.vercel.app',
  );
  process.exit(2);
}

async function readJsonEndpoint(pathname) {
  const response = await fetch(
    `${baseUrl}${pathname}`,
    {
      headers: {
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    },
  );

  const contentType =
    response.headers.get('content-type') || '';

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `${pathname} retornou HTTP ${response.status}: ${responseText.slice(0, 300)}`,
    );
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `${pathname} não retornou JSON (Content-Type: ${contentType || 'ausente'}).`,
    );
  }

  return response.json();
}

async function run() {
  const health = await readJsonEndpoint(
    '/api/health',
  );

  if (
    health.status !== 'ok' ||
    health.services?.api !== 'ok'
  ) {
    throw new Error(
      '/api/health respondeu, mas a API não declarou estado ok.',
    );
  }

  const packages = await readJsonEndpoint(
    '/api/packages',
  );

  if (
    packages.success !== true ||
    !Array.isArray(packages.data) ||
    packages.data.length === 0
  ) {
    throw new Error(
      '/api/packages não retornou os pacotes oficiais.',
    );
  }

  console.log(
    `Smoke test aprovado em ${baseUrl}: health e packages operacionais.`,
  );
}

run().catch((error) => {
  console.error(
    `Smoke test falhou: ${
      error instanceof Error
        ? error.message
        : String(error)
    }`,
  );
  process.exit(1);
});
