module.exports = function (request, options) {
  // When preferring "import" some CJS modules
  // end up requiring "MJS".
  // Ex: Must use import to load ES Module: C:\src\TheCoin\node_modules\pouchdb\node_modules\uuid\wrapper.mjs
  const conditions = options.conditions
    ? ["development", ...options.conditions]
    : undefined;
  console.log(`${request} - ${conditions}`)

  return options.defaultResolver(request, {
    ...options,
    conditions,
  })
}
