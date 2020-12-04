const less = require('less');
const fs = require('fs'); 
const glob = require('glob');
const path = require('path');

console.log("Compiling Semantic LESS");

const siteFolder = path.resolve(__dirname, '..');
const stylesFolder = path.resolve(siteFolder, 'app', 'styles', 'semantic');
const semanticFolder = path.resolve(siteFolder, 'node_modules', 'semantic-ui-less');
const outputFolder = path.resolve(siteFolder, '..', '..', 'build', '.obj', 'site', 'styles', 'semantic')
async function run(){

  const options = {
    env: process.env.NODE_ENV,
    logLevel: 2,
    paths: [
      semanticFolder, 
      stylesFolder,
      path.join(stylesFolder, 'a', 'b'), // Dummy folder gives path allowing finding theme.config
    ],
    sourceMap: { 
      sourceMapFileInline: true
    },
  };
  
  const input = fs.readFileSync(path.join(semanticFolder, 'semantic.less'), 'utf8');
  try {
    const results = await less.render(input, options);
    const css = results.css.replace("../../themes", "themes");
    fs.writeFileSync(path.join(outputFolder, "semantic.css"), css);
    fs.writeFileSync(path.join(outputFolder, "semantic.css.map"), results.map);

    // Copy all non-less/override etc files to the output folder
    glob(`${semanticFolder}/**/*.*`, 
      {
        ignore:[
          '**/*.less', 
          '**/*.overrides', 
          "**/*.variables",
          "**/*.js",
          "**/*.json",
          "**/*.example",
        ]
      }, 
      (err, files) => {
        files.forEach(async (file, index) => {
          const relpath = path.relative(semanticFolder, file);
          try {
            const outpath = path.join(outputFolder,relpath)
            const parsed = path.parse(outpath);
            await fs.promises.mkdir(parsed.dir, { recursive: true });
            await fs.promises.copyFile(file, outpath, console.log)
            //console.log(`Copied ${index} of ${files.length}: ${file}`)
          }
          catch(err) {
            console.error("Copying failed:\n\t" + err.message);
          }
        })
      }
    );
  }
  catch (e) {
    console.error(e.message);
    exit(-1);
  }
}

run();