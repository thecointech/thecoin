//
// Moved into its balh
const { existsSync } = require('fs');

module.exports = {
  projectUrl: () => {
    let baseUrl = new URL(`../../../`, new URL(import.meta.url));
    while (!existsSync(new URL("environments", baseUrl))) {
      const parentUrl = new URL(`..`, baseUrl);
      if (parentUrl == baseUrl) {
        throw new Error("Could not find project root");
      }
      baseUrl = parentUrl;
    }
    return baseUrl;
  },
}
