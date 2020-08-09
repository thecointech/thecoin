import baseConfig from '../../../tsconfig.base.json';

export function GenerateAliases() {
    const paths = baseConfig.compilerOptions.paths;
    let r = {}
    for (let [key, value] of Object.entries(paths)) {
      // Trim trailing slashes
      if (key.endsWith('/*'))
        key = key.slice(0,-2);

      r[key] = key + "/build";
    }
  
    console.log(r);
    return r;
  }
  