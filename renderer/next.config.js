const { i18n } = require('../next-i18next.config');

module.exports = {
  i18n,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
      config.node = {
        __dirname: true,
      };
    }
    config.output.globalObject = 'this';
    return config;
  },
};
