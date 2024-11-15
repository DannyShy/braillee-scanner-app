import * as path from 'path';
import { copyFileSync, readFileSync } from 'fs';
import { build as electronBuild, createTargets, Platform } from 'electron-builder';
import { notarize } from '@electron/notarize';

const afterSign = async ({ electronPlatformName, packager, appOutDir }) => {
  if (electronPlatformName !== 'darwin') {
    return;
  }
  const appName = packager.appInfo.productFilename;
  return await notarize({
    appBundleId: 'com.hotovo.dotsight',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    ascProvider: process.env.APPLE_TEAM_ID,
  });
};

const build_ = async (publish) => {
  const destDir = process.env.DEST_DIR;
  const packageJSON = JSON.parse(readFileSync('./package.json').toString());
  const buildVersion = process.env.VERSION || packageJSON.version;

  const config = {
    ...packageJSON.build,
    buildVersion,
    artifactName: '${productName}-${version}.${ext}',
    afterSign,
  };

  const platforms = process.env.BUILD_TARGETS
    ? [
        process.env.BUILD_TARGETS.includes('windows') && Platform.WINDOWS,
        process.env.BUILD_TARGETS.includes('linux') && Platform.LINUX,
        process.env.BUILD_TARGETS.includes('mac') && Platform.MAC,
      ].filter(Boolean)
    : [Platform.LINUX, Platform.WINDOWS, Platform.current()];
  const targets = createTargets(platforms);
  const options = {
    targets,
    config,
  };

  if (publish) {
    options.publish = 'always';
  }

  const artifacts = await electronBuild({
    targets,
    config,
  });

  if (destDir) {
    artifacts.forEach((artifact) => {
      const artifactName = path.basename(artifact);
      const artifactExt = path.extname(artifactName);
      if (['.dmg', '.exe', '.AppImage', '.blockmap'].includes(artifactExt)) {
        copyFileSync(artifact, path.join(process.env.DEST_DIR, artifactName));
      }
    });
  }
};

const build = () => build_(false);
const buildAndDeploy = () => build_(true);

export { build, buildAndDeploy };
