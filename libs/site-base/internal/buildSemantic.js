const less = require('less')
const path = require('path');
const fs = require('fs');




const f = async () => {
  const projectRoot = path.join(__dirname, "..")
  const semanticRoot = path.join(projectRoot, "node_modules", "semantic-ui-less", "semantic.less");
  const themeRoot = path.join(projectRoot, "src", "styles", "semantic", "na", "na");
  const content = fs.readFileSync(semanticRoot).toString();

  var outputFilename = path.join(projectRoot, "build", "styles", "semantic.css")

  try {

    const {css} = await less.render(content, {
      filename: path.resolve(semanticRoot),
      paths: [themeRoot],
      rootpath: "../../node_modules/semantic-ui-less/na/na",
      globalVars: {
        project_root: `'${projectRoot}'`
      }
    })
    fs.writeFileSync(outputFilename, css);
    console.log("CSS written to " + outputFilename);
  }
  catch(err)
  {
    console.error(err);
  }
};
f();


