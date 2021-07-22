
const path = require('path');
const { ProvidePlugin } = require('webpack');
// In non-live dev mode, we redirect imports to mocked versions
const projectRoot = path.resolve(__dirname, '..', '..');
const mocksFolder = path.resolve(projectRoot, '__mocks__');

module.exports = {
  module: {
    rules: [
      // Allow ts-loader to parse mocks
      {
        test: /\.ts(x?)$/,
        include: mocksFolder,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.join(projectRoot, 'tsconfig.base.json'),
            transpileOnly: true,
            experimentalWatchApi: true,
          },
        },
      }
    ],
  },
  plugins: [
    new ProvidePlugin({
      jest: path.join(mocksFolder, 'shim_jest')
    })
  ],
  // Re-use our jest mocks inside our website (neat, huh?)
  resolve: {
    modules: [mocksFolder]
  }
}
