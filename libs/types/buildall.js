const { readFileSync, writeFileSync } = require('fs');
const swaggerToTS = require('@manifoldco/swagger-to-ts').default;
const yaml = require('js-yaml');

const root = __dirname + "\\.."
file = readFileSync(`${root}\\broker-cad/broker-cad.yaml`, 'utf8');
const input = yaml.safeLoad(file); // Input be any JS object (OpenAPI format)
const output = swaggerToTS(input, { namespace: 'BrokerCAD' }); // Outputs TypeScript defs as a string (to be parsed, or written to a file)

writeFileSync("./src/BrokerCAD.ts", `export ${output}`, );
// To keep this in sync with our build expectations,
// we also directly export this as a types file to our build folder
// This isn't stricly necessary, but it's nice to be consistent
writeFileSync("../build/types/BrokerCAD.d.ts", `export ${output}`, );