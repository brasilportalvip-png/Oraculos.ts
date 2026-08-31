import serverModule from '../dist/serverless.cjs';

const app = serverModule.default || serverModule;

export default app;
