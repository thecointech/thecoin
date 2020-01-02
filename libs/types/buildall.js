const { readFileSync, writeFileSync } = require('fs');
const swaggerToTS = require('@manifoldco/swagger-to-ts').default;
const yaml = require('js-yaml');
const path = require('path');

const root = path.resolve(__dirname, "..", "..")
const yaml_path = path.resolve(root, "apis", "broker-cad.yaml")
file = readFileSync(yaml_path, 'utf8');
const input = yaml.safeLoad(file); // Input be any JS object (OpenAPI format)
const output = swaggerToTS(input, { 
    wrapper: false,
    injectWarning: true,
  }); // Outputs TypeScript defs as a string (to be parsed, or written to a file)

writeFileSync("./src/index.ts", output);
// To keep this in sync with our build expectations,
// we also directly export this as a types file to our build folder
// This isn't stricly necessary, but it's nice to be consistent
writeFileSync(`${root}/build/types/index.ts`, output);