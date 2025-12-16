const less = require('less')
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const options = require('./vars.cjs');

const f = async () => {
  const projectRoot = path.join(__dirname, "..")
  const semanticRoot = path.join(projectRoot, "node_modules", "semantic-ui-less");
  const semanticLess = path.join(semanticRoot, "semantic.less");

  const siteRoot = path.join(process.cwd(), "src");
  const outputFolder = path.join(siteRoot, "semantic");
  const outputFilename = path.join(outputFolder, "semantic.css");


  try {
    const {paths, modifyVars} = options('');
    const content = fs.readFileSync(semanticLess).toString();
    const {css} = await less.render(content, {
      filename: path.resolve(semanticLess),
      paths,
      rootpath: "semantic/",
      rewriteUrls: 'local',
      globalVars: modifyVars,
    })


    const fixedCss = css
      // Fix semantic-ui-less bug: replace invalid :ActiveHover pseudo-class with :active:hover
      // see https://github.com/Semantic-Org/Semantic-UI/issues/5908
      .replace(/:ActiveHover/g, ':active:hover')
      // Fix semantic-ui-less bug: remove invalid descendant selectors after pseudo-elements
      // Pseudo-elements cannot have descendant selectors
      .replace(/(\[data-tooltip\]\[data-inverted\]:after) \.header \{/g, '$1 {');

    if (!fs.existsSync(outputFolder))
      fs.mkdirSync(outputFolder);

    fs.writeFileSync(outputFilename, fixedCss);
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
