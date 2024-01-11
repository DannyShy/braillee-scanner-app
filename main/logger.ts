import fs from 'fs';
import { mkdirSync } from 'original-fs';
import winston, { transports, format } from 'winston';
import { IS_PROD, LOGS_PATH } from './utils/constants';

const { combine, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

if (!fs.existsSync(LOGS_PATH)) {
  mkdirSync(LOGS_PATH);
}

const logger = winston.createLogger({
  level: 'debug',
  format: combine(format.timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: 'background.log',
      dirname: LOGS_PATH,
      // zippedArchive: true,
      maxsize: 1024 * 1024,
      maxFiles: 5,
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
