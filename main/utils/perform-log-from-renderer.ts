import fs from 'fs';
import { mkdirSync } from 'original-fs';
import winston, { transports, format } from 'winston';
import { IS_PROD, LOGS_PATH } from './constants';

const { combine, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

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
      // zippedArchive: true,
      maxsize: 1024 * 1024,
      maxFiles: 5,
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

const performLogFromRenderer = (status: string, text: string) => {
  if (status === 'info') {
    rendererLogger.info(text);
  } else if (status === 'debug') {
    rendererLogger.debug(text);
  } else if (status === 'error') {
    rendererLogger.error(text);
  }
};

export { performLogFromRenderer };
