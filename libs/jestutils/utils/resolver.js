const { existsSync } = require('fs');
const path = require('path');

module.exports = function (request, options) {
  // When preferring "import" some CJS modules
  // end up requiring "MJS".
  // Ex: Must use import to load ES Module: C:\src\TheCoin\node_modules\pouchdb\node_modules\uuid\wrapper.mjs
  const conditions = options.conditions
    ? ["development", ...options.conditions]
    : undefined;

  try {
    const r = options.defaultResolver(request, {
      ...options,
      conditions,
    })

    // Jest resolver only resolves the first entry of an
    // `exports` object, so where we have multiple (site-base)
    // it always returns the first one, even when it is the second
    // that is valid
    if (request.includes("@thecointech")) {
      if (!existsSync(r)) {
        // see if there is a folder & index.js here
        const parsed = path.parse(r);
        const index = path.join(parsed.dir, parsed.name, "index.js");
        if (existsSync(index)) {
          return index;
        }
      }
    }
    // console.log(`${request}\t -> ${r}`);
    return r;
  }
  catch (err) {
    // console.log(err);
    throw err;
  }
}
