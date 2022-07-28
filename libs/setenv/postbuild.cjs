const fs = require('fs');
const path = require('path');

const outfile = path.join(__dirname, './build/cjs/package.json')
if (!fs.existsSync(outfile)) {
  fs.writeFileSync(outfile, "{\n\t\"type\": \"commonjs\"\n}", 'utf8');
}
