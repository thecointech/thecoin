const less = require('less')
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const f = async () => {
  const projectRoot = path.join(__dirname, "..")
  const semanticRoot = path.join(projectRoot, "node_modules", "semantic-ui-less");
  const semanticLess = path.join(semanticRoot, "semantic.less");
  const stylesRoot = path.join(projectRoot, "src", "styles");
  const themeRoot = path.join(stylesRoot, "semantic", "na", "na");

  const outputFolder = path.join(projectRoot, "build", "styles");
  var outputFilename = path.join(outputFolder, "semantic.css")

  try {
    const content = fs.readFileSync(semanticLess).toString();
    const {css} = await less.render(content, {
      filename: path.resolve(semanticLess),
      paths: [themeRoot],
      rootpath: "semantic/",
      rewriteUrls: 'local',
      globalVars: {
        project_root: `'${projectRoot}'`
      }
    })
    fs.writeFileSync(outputFilename, css);
    console.log("CSS written to " + outputFilename);

    // Copy other files
    var files = glob.sync(`${semanticRoot}/**/*.{png,eot,ttf,svg,woff,woff2}`);
    files.forEach(src => {
      const r = path.relative(semanticRoot, src);
      const dest = path.join(outputFolder, "semantic", r);
      const outdir = path.dirname(dest);
      if (!fs.existsSync(outdir))
        fs.mkdirSync(outdir, {recursive: true})
      fs.copyFileSync(src, dest)
    });
  }
  catch(err)
  {
    console.error(err);
  }
};
f();


