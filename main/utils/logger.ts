import winston, { transports, format } from 'winston';
import { APP_DATA_PATH, IS_PROD } from './constants';

const { combine, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(format.timestamp(), myFormat),
  transports: [new winston.transports.File({ filename: 'logs.log', dirname: APP_DATA_PATH })],
});

if (!IS_PROD) {
  logger.add(
    new transports.Console({
      format: myFormat,
    }),
  );
}

export { logger };
