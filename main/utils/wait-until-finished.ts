import { ChildProcessWithoutNullStreams } from 'child_process';
import { logger } from '../logger';

const waitUntilFinished = async (process: ChildProcessWithoutNullStreams): Promise<[number, string]> => {
  const errors: string[] = [];

  process.stdout.on('data', (data) => {
    logger.info(`stdout from waitUntilFinished: ${data}`);
  });
  process.stderr.on('data', (data) => {
    logger.error(`stderr from waitUntilFinished: ${data}`);
    errors.push(data);
  });
  process.on('exit', (code, signal) => {
    if (signal) {
      logger.error(`Child process was killed by signal: ${signal}`);
    }
  });
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception in child process: ${error.message}`);
  });
  return new Promise<[number, string]>((resolve, reject) => {
    process.on('close', (code) => {
      if (code !== 0) {
        logger.error(
          `Child process in waitUntilFinished exited with non-zero status code: ${code}. This means spawn process failed`,
        );
      }
      resolve([code, errors.join('\n')]);
    });

    process.on('error', (error) => {
      logger.error(`Error occurred while waiting for child process in waitUntilFinished to finish: ${error.message}`);
      reject(error);
    });
  });
};

export { waitUntilFinished };
