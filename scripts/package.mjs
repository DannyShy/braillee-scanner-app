import { build } from './common.mjs';

build().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
