import fs from "fs";
import { globSync } from "glob";
import path from "path";

function readTsConfig() {
  try {
    if (fs.existsSync("./tsconfig.build.json")) {
      const cfgString = fs.readFileSync("./tsconfig.build.json");
      return JSON.parse(cfgString).compilerOptions;
    }
  } catch (err) {
    console.error(`Cannot parse: ./tsconfig.json - ${err.message}`);
    throw err;
  }
  // if no tsconfig we just make our best guess
  return {
    rootDir: "./src",
    outDir: "./build",
  };
}

const { rootDir, outDir } = readTsConfig();
const typesGlob = process.argv[2] ?? "./**/*.+(svg|png|module.less)";
for (const f of globSync(typesGlob, {
  cwd: path.join(process.cwd(), rootDir),
})) {
  const { base, dir } = path.parse(f);
  const dpath = path.join(outDir, dir);
  const outpath = path.join(dpath, base);

  try {
    fs.mkdirSync(dpath, { recursive: true });
  } catch (e) {}
  try {
    fs.unlinkSync(outpath);
  } catch (e) {}

  const relativef = path.relative(dpath, path.join(rootDir, f));
  fs.symlinkSync(relativef, outpath);
}
