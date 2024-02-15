import fs from 'fs';
import { mkdirSync } from 'original-fs';
import winston, { transports, format } from 'winston';
import { APP_DATA_PATH, IS_PROD, LOGS_PATH } from './constants';

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

const rendererLogger = winston.createLogger({
  level: 'debug',
  format: combine(format.timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: 'renderer.log',
      dirname: LOGS_PATH,
      zippedArchive: true,
      maxsize: 1024 * 1024,
      tailable: true,
    }),
  ],
});

if (!IS_PROD) {
  rendererLogger.add(
    new transports.Console({
      format: myFormat,
    }),
  );
}

const performLogFromRenderer = (level: string, message: string) => {
  if (level === 'info') {
    rendererLogger.info(message);
  } else if (level === 'debug') {
    rendererLogger.debug(message);
  } else if (level === 'error') {
    rendererLogger.error(message);
  }
};

export { performLogFromRenderer };
