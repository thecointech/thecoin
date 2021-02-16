import fs from 'fs';
import glob from 'glob';
import path from 'path';

function readTsConfig() {
  const cfgString = fs.readFileSync('./tsconfig.json');
  try {
    return JSON.parse(cfgString);
  }
  catch (err) {
    console.error(`Cannot parse:\n ${cfgString}`);
    throw err;
  }
}


var tsconfig = readTsConfig();

const {rootDir, outDir} = tsconfig.compilerOptions;
const typesGlob = process.argv[2];
for (const f of glob.sync(path.join(rootDir, typesGlob)))
{
  const {base, dir} = path.parse(f);
  const rpath = path.relative(rootDir, dir);
  const dpath = path.join(outDir, rpath);
  fs.mkdirSync(dpath, {recursive: true});
  const outpath = path.join(dpath, base);

  try {
    fs.unlinkSync(outpath);
  } catch (e) {}

  const absf = path.join(process.cwd(), f);
  fs.symlinkSync(absf, outpath);
}


