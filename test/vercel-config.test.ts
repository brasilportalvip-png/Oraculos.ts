import fs from 'fs';
import path from 'path';
import {
  describe,
  expect,
  it,
} from 'vitest';

interface VercelConfig {
  buildCommand?: string;
  outputDirectory?: string;
  rewrites?: Array<{
    source?: string;
    destination?: string;
  }>;
}

interface PackageJson {
  scripts?: Record<string, string>;
}

const readJson = <T>(
  filename: string,
): T =>
  JSON.parse(
    fs.readFileSync(
      path.resolve(
        process.cwd(),
        filename,
      ),
      'utf8',
    ),
  ) as T;

const config =
  readJson<VercelConfig>('vercel.json');

const packageJson =
  readJson<PackageJson>('package.json');

const buildSource = fs.readFileSync(
  path.resolve(
    process.cwd(),
    'scripts/build.cjs',
  ),
  'utf8',
);

describe('Contrato de implantação da Vercel', () => {
  it('gera o pacote serverless antes de montar a função', () => {
    expect(config.buildCommand).toBe(
      'npm run build',
    );

    expect(config.outputDirectory).toBe(
      'dist/public',
    );

    expect(
      packageJson.scripts?.['vercel-build'],
    ).toBe('npm run build');

    expect(packageJson.scripts?.build).toBe(
      'node scripts/build.cjs',
    );

    expect(buildSource).toContain(
      "outfile: 'dist/serverless.cjs'",
    );

    expect(buildSource).toContain(
      'process.env.VERCEL',
    );
  });

  it('usa somente a entrada CommonJS empacotada para a API', () => {
    expect(
      fs.existsSync(
        path.resolve(
          process.cwd(),
          'api/index.cjs',
        ),
      ),
    ).toBe(true);

    expect(
      fs.existsSync(
        path.resolve(
          process.cwd(),
          'api/index.ts',
        ),
      ),
    ).toBe(false);

    const entrySource = fs.readFileSync(
      path.resolve(
        process.cwd(),
        'api/index.cjs',
      ),
      'utf8',
    );

    expect(entrySource).toContain(
      "require('../dist/serverless.cjs')",
    );
  });

  it('encaminha a API antes do fallback da SPA', () => {
    expect(config.rewrites?.[0]).toEqual({
      source: '/api/(.*)',
      destination: '/api/index',
    });

    expect(config.rewrites?.[1]).toEqual({
      source: '/(.*)',
      destination: '/index.html',
    });
  });
});
