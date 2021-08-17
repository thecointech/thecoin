// In development mode, we mock most external libraries
const mockOptions = process.env.NODE_ENV !== 'production'
  ? require('../../__mocks__/mock_webpack')
  : {};

module.exports = mockOptions
