const less = require('less')
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

const f = async () => {
  const projectRoot = path.join(__dirname, "..")
  const semanticRoot = path.join(projectRoot, "node_modules", "semantic-ui-less");
  const semanticLess = path.join(semanticRoot, "semantic.less");
  const stylesRoot = path.join(projectRoot, "src");
  const themeRoot = path.join(stylesRoot, "semantic", "na", "na");

  const outputFolder = path.join(projectRoot, "build");
  var outputFilename = path.join(outputFolder, "semantic.css")

  try {
    const content = (await fs.readFile(semanticLess)).toString();
    const {css} = await less.render(content, {
      filename: path.resolve(semanticLess),
      paths: [themeRoot],
      rootpath: "semantic/",
      rewriteUrls: 'local',
      globalVars: {
        project_root: `'${projectRoot}'`
      }
    })
    console.log(`checking: ${outputFolder}`);
    if (!fs.existsSync(outputFolder))
      fs.mkdirSync(outputFolder);

    fs.writeFileSync(outputFilename, css);
    console.log("CSS written to " + outputFilename);

    // Copy other files
    var files = glob.sync(`${semanticRoot}/**/*.{png,eot,ttf,svg,woff,woff2}`);
    files.forEach(src => {
      const r = path.relative(semanticRoot, src);
      const dest = path.join(outputFolder, "semantic", r);
      const outdir = path.dirname(dest);
      fs.ensureDirSync(outdir)
      fs.copyFileSync(src, dest)
    });
  }
  catch(err)
  {
    console.error(err);
  }
};
f();


