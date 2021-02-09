import fs from 'fs';
import glob from 'glob';
import path from 'path';

const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json'));

const {rootDir, outDir} = tsconfig.compilerOptions;
const typesGlob = process.argv[2];

for (const f of glob.sync(rootDir + typesGlob))
{
  const {base, dir} = path.parse(f);
  const rpath = path.relative(rootDir, dir);
  const dpath = path.join(outDir, rpath);
  fs.mkdirSync(dpath, {recursive: true});
  const outpath = path.join(dpath, base);
  console.log(`Linking: ${f} to ${outpath}`)
  try {
    fs.unlinkSync(outpath);
  } catch (e) {}

  const absf = path.join(process.cwd(), f);
  fs.symlinkSync(absf, outpath);
}
