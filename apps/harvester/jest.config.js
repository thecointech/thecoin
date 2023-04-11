/** @type {import('ts-jest').JestConfigWithTsJest} */
/** NOTE: Admin/Harvester cannot (yet) be defined as "type": "module"
 * once I figure that out this should be normalized with the rest of the jest configs
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: "src",
};
