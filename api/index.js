const serverless = require('serverless-http');
const createApp = require('../src/app');

const app = createApp();

module.exports = serverless(app);
