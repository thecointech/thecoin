require = require("esm")(module/*, options*/)

// In development mode, we mock most external libraries
const mockOptions = process.env.NODE_ENV !== 'production'
  ? require('../../__mocks__/mock_webpack.mjs').default
  : {};

module.exports = mockOptions
