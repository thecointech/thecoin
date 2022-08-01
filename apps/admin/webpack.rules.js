module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        configFile: __dirname + '/tsconfig.build.json',
        transpileOnly: true,
        experimentalWatchApi: true,
        projectReferences: true,
      }
    }
  },
];
