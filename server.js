require('dotenv').config();
const http = require('http');
const config = require('./config.js');
const logger = require('./logger');
const app = require('./app');

app.set('port', config.get('port'));
app.set('env', config.get('env'));
app.set('x-powered-by', false);

const server = http.createServer(app);

server.listen(config.get('port'), config.get('ip'), () => {
  const addrInfo = server.address();
  logger.info(`Server running on http://${addrInfo.address}:${addrInfo.port}`);
});
