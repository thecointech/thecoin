import * as glob from 'glob';
import * as sharp from 'sharp'

async function convertFiles() {
  const files = glob.sync("./src/images/*.svg");
  for (const infile of files) {
    console.log("Converting: " + infile)
    const webpfile = infile.replace(".svg", ".webp")
    const pngfile = infile.replace(".svg", ".png")
    // Convert optimized
    await sharp(infile)
      .webp({ lossless: true })
      .toFile(webpfile);
    // Convert png
    await sharp(infile)
      .png({quality: 100})
      .toFile(pngfile)
  }
}


convertFiles();
