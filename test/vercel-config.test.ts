import fs from 'fs';
import path from 'path';
import {
  describe,
  expect,
  it,
} from 'vitest';

interface VercelConfig {
  builds?: Array<{
    src?: string;
    use?: string;
    config?: {
      distDir?: string;
    };
  }>;
  routes?: Array<{
    src?: string;
    dest?: string;
    handle?: string;
  }>;
}

const config = JSON.parse(
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      'vercel.json',
    ),
    'utf8',
  ),
) as VercelConfig;

describe('Contrato de implantação da Vercel', () => {
  it('publica o Express como função Node e mantém o backend fora dos arquivos públicos', () => {
    expect(config.builds).toContainEqual({
      src: 'server.ts',
      use: '@vercel/node',
    });

    expect(config.builds).toContainEqual({
      src: 'package.json',
      use: '@vercel/static-build',
      config: {
        distDir: 'dist/public',
      },
    });
  });

  it('encaminha a API ao Express antes do fallback da SPA', () => {
    const apiRouteIndex =
      config.routes?.findIndex(
        (route) =>
          route.src === '/api/(.*)' &&
          route.dest === '/server.ts',
      ) ?? -1;

    const filesystemIndex =
      config.routes?.findIndex(
        (route) =>
          route.handle === 'filesystem',
      ) ?? -1;

    const spaIndex =
      config.routes?.findIndex(
        (route) =>
          route.src === '/(.*)' &&
          route.dest === '/index.html',
      ) ?? -1;

    expect(apiRouteIndex).toBeGreaterThanOrEqual(0);
    expect(filesystemIndex).toBeGreaterThan(
      apiRouteIndex,
    );
    expect(spaIndex).toBeGreaterThan(
      filesystemIndex,
    );
  });
});
