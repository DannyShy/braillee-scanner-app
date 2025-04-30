import { exec } from 'node:child_process';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { credentials } from './credentials.mjs';

const assumeDeployRole = async () => {
  const client = new STSClient({
    region: credentials.AWS_REGION,
    credentials:
      credentials.AWS_ACCESS_KEY_ID && credentials.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: credentials.AWS_ACCESS_KEY_ID,
            secretAccessKey: credentials.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
  const command = new AssumeRoleCommand({
    RoleArn: 'arn:aws:iam::563997403030:role/deploy',
    RoleSessionName: 'npm-deploy',
  });
  const data = await client.send(command);
  return (
    data.Credentials && {
      ACCESS_KEY_ID: data.Credentials.AccessKeyId,
      SECRET_ACCESS_KEY: data.Credentials.SecretAccessKey,
      SESSION_TOKEN: data.Credentials.SessionToken,
    }
  );
};

const main = async () => {
  const awsCredentials = await assumeDeployRole();
  process.env.AWS_ACCESS_KEY_ID = awsCredentials.ACCESS_KEY_ID;
  process.env.AWS_SECRET_ACCESS_KEY = awsCredentials.SECRET_ACCESS_KEY;
  process.env.AWS_SESSION_TOKEN = awsCredentials.SESSION_TOKEN;

  return new Promise((resolve, reject) => {
    const child = exec('nextron build --win --x64 --publish always', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout || stderr);
      }
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  _process.exit(1);
});
