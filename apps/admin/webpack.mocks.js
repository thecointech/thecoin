// In development mode, we mock most external libraries
const mockOptions = process.env.NODE_ENV !== 'production'
  ? require('@thecointech/setenv/webpack')
  : {};

module.exports = mockOptions
