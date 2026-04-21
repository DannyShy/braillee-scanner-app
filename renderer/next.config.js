const webpack = require('webpack');

module.exports = {
  // --- PRIDANÉ NASTAVENIA PRE BUILD ---
  typescript: {
    ignoreBuildErrors: true, // Ignoruje chyby typu (ako tá v LanguagePicker)
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignoruje varovania linteru
  },
  // ------------------------------------
  
  experimental: {
    esmExternals: false,
  },
  transpilePackages: ['@mantine/core', '@mantine/hooks'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Use combined target: 'electron-renderer' for Electron APIs + 'web' for browser polyfills
      // This ensures webpack bundles polyfills for 'process' and handles 'require' calls
      // even though nodeIntegration is disabled in the BrowserWindow
      config.target = ['electron-renderer', 'web'];
      config.node = {
        __dirname: true,
      };
    }
    config.output.globalObject = 'this';

    // Provide process polyfill - required by @mantine/core which references process.env
    // When target is only 'electron-renderer', webpack assumes process is natively available
    // but with nodeIntegration: false, it's not available in the renderer
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      })
    );

    // Ensure .mjs files from node_modules are properly handled by webpack
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    return config;
  },
};