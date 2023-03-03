import { readFileSync, writeFileSync } from 'fs';
import hre from 'hardhat';

hre.run('compile');

const code = readFileSync(new URL('../contracts/ShockAbsorber.sol', import.meta.url), 'utf-8');
writeFileSync(new URL('../contract-src.json', import.meta.url), JSON.stringify({ code }));
