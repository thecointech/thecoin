import fs from 'fs';
import glob from 'glob';
import path from 'path';

function readTsConfig() {
  try {
    if (fs.existsSync('./tsconfig.build.json')) {
      const cfgString = fs.readFileSync('./tsconfig.build.json');
      return JSON.parse(cfgString).compilerOptions;
    }
  }
  catch (err) {
    console.error(`Cannot parse: ./tsconfig.json - ${err.message}`);
    throw err;
  }
  // if no tsconfig we just make our best guess
  return {
    rootDir: './src',
    outDir: './build',
  }
}

const {rootDir, outDir} = readTsConfig();
const typesGlob = process.argv[2] ?? "./**/*.+(svg|png|module.less)";
for (const f of glob.sync(path.join(rootDir, typesGlob)))
{
  const {base, dir} = path.parse(f);
  const rpath = path.relative(rootDir, dir);
  const dpath = path.join(outDir, rpath);
  const outpath = path.join(dpath, base);

  try {
    fs.mkdirSync(dpath, {recursive: true});
  } catch (e) {};
  try {
    fs.unlinkSync(outpath);
  } catch (e) {}

  const absf = path.join(process.cwd(), f);
  fs.symlinkSync(absf, outpath);
}


