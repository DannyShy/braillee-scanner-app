import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { buildAndDeploy } from './common.mjs';

const assumeDeployRole = async () => {
  const client = new STSClient({
    region: process.env.AWS_REGION,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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

  await buildAndDeploy();
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
