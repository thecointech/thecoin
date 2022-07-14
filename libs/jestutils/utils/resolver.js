// temporary workaround while we wait for https://github.com/facebook/jest/issues/9771
const resolver = require('enhanced-resolve').create.sync({
  conditionNames: ['development', 'node', 'require', 'default'],
  extensions: ['.js', '.json', '.node', '.ts', '.tsx']
})

module.exports = function (request, options) {
  if (request === 'fs') {
    return options.defaultResolver(request, options);
  }
  return resolver(options.basedir, request)
}
