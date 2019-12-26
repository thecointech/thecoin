const { readFileSync, writeFileSync } = require('fs');
const swaggerToTS = require('@manifoldco/swagger-to-ts').default;
const yaml = require('js-yaml');

const root = __dirname + "\\.."
file = readFileSync(`${root}\\broker-cad/broker-cad.yaml`, 'utf8');
const input = yaml.safeLoad(file); // Input be any JS object (OpenAPI format)
const output = swaggerToTS(input, { namespace: 'BrokerCAD' }); // Outputs TypeScript defs as a string (to be parsed, or written to a file)

writeFileSync("./lib/BrokerCAD.ts", `export ${output}`, );