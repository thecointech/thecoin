import { readFileSync, writeFileSync } from 'fs';
import hre from 'hardhat';

hre.run("compile");

// hack-up a version of the

const r = readFileSync(new URL("../contracts/plugins/RoundNumber.sol", import.meta.url), "utf8");
writeFileSync(
  new URL('../src/RoundNumber.sol.json', import.meta.url),
  JSON.stringify({
    src: r
  })
);
