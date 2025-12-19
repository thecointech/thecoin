import less from 'less';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { vars } from './vars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const build = async () => {
  const projectRoot = path.join(__dirname, "..")
  const semanticRoot = path.join(projectRoot, "node_modules", "semantic-ui-less");
  const semanticLess = path.join(semanticRoot, "semantic.less");

  const siteRoot = path.join(process.cwd(), "src");
  const outputFolder = path.join(siteRoot, "semantic");
  const outputFilename = path.join(outputFolder, "semantic.css");


  try {
    const { paths, modifyVars } = vars('');
    const content = fs.readFileSync(semanticLess).toString();
    const options: Less.Options = {
      filename: path.resolve(semanticLess),
      paths,
      rootpath: "semantic/",
      rewriteUrls: "local",
      modifyVars,
    }
    const { css } = await less.render(content, options);


    const fixedCss = css
      // Fix semantic-ui-less bug: replace invalid :ActiveHover pseudo-class with :active:hover
      // see https://github.com/Semantic-Org/Semantic-UI/issues/5908
      .replace(/:ActiveHover/g, ':active:hover')
      // Fix semantic-ui-less bug: remove invalid descendant selectors after pseudo-elements
      // Pseudo-elements cannot have descendant selectors
      .replace(/(\[data-tooltip]\[data-inverted]:after) \.header \{/g, '$1 {');

    if (!fs.existsSync(outputFolder))
      fs.mkdirSync(outputFolder);

    fs.writeFileSync(outputFilename, fixedCss);
    console.log("CSS written to " + outputFilename);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

build();
