const dotenv = require('dotenv');
const createApp = require('./app');

dotenv.config();

const app = createApp();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
