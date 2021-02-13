const logger = require('./logger');

test('NODE_ENV expect to be test', () => {
  expect(process.env.NODE_ENV).toBe('test');
});

test('Should log', () => {
  logger.debug('debug message');
  logger.info('info message');
  logger.warn('warn message');
  logger.error('error message');
  expect(1).toBe(1);
});
