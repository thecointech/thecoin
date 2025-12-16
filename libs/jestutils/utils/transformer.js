// This transformer (somehow) fixes
// the typescript compilation in the following setup
// packageA
//   a.test.ts -> "import { foo } from 'packageB/utils'"
//   tsconfig -> "paths": { "@/*": ["./src/*"] }
// packageB
//   utils/foo.ts -> "import { fn } from '@/file.ts'"
//   src/file.ts -> "export const fn = 1"
//   tsconfig -> "paths": { "@/*": ["./src/*"] }
// In regular node/ts-node land, this code works
// because the file utils/foo.ts is compiled against
// the tsconfig at it's root.  However, in ts-jest,
// only a single tsconfig is used, so file foo.ts is
// compiled against the tsconfig at the root of packageA,
// not the location of the file being imported.
//
// Here, it somehow works because it doesn't resolve that
// filepath.  The code output keeps the "@/file.ts" import,
// and the resolver.js does the work of finding it's path

const tsJest = require('ts-jest');

// This map will cache transformer instances by configuration hash/key,
// which is safer in complex Jest environments.
const transformerCache = new Map();

function createTransformer(config) {
  // Use JSON.stringify for a simple unique key for the transformer config
  const configKey = JSON.stringify(config);

  if (transformerCache.has(configKey)) {
    return transformerCache.get(configKey);
  }

  const tsJestInstance = tsJest.default.createTransformer(config);

  // This custom transformer somehow prevents full path resolution
  // effectively this is simply type-stripping through ts-jest
  const customTransformer = {
    process: function (src, filename, transformOptions) {
      // console.log("Processing: ", filename);
      const result = tsJestInstance.process(src, filename, transformOptions);
      return result;
    },
    getCacheKey: function (...args) {
      return tsJestInstance.getCacheKey?.(...args);
    },
  };

  transformerCache.set(configKey, customTransformer);
  return customTransformer;
}
module.exports = {
  createTransformer,
};
