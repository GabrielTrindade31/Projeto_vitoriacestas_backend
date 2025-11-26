const createApp = require('../src/app');

const app = createApp();

module.exports = (req, res) => app(req, res);
