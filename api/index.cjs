const serverModule = require('../dist/serverless.cjs');

module.exports = serverModule.default || serverModule;
