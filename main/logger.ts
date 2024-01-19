import fs from 'fs';
import { mkdirSync } from 'original-fs';
import winston, { transports, format } from 'winston';
import { APP_DATA_PATH, IS_PROD, LOGS_PATH } from './utils/constants';

const { combine, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

if (!fs.existsSync(APP_DATA_PATH)) {
  mkdirSync(APP_DATA_PATH);
}

if (!fs.existsSync(LOGS_PATH)) {
  mkdirSync(LOGS_PATH);
}

const logger = winston.createLogger({
  level: 'info',
  format: combine(format.timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: 'background.log',
      dirname: LOGS_PATH,
      zippedArchive: true,
      maxsize: 1024 * 1024,
      tailable: true,
    }),
  ],
});

if (!IS_PROD) {
  logger.add(
    new transports.Console({
      format: myFormat,
    }),
  );
}

export { logger };
