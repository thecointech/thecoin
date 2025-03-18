import webpack from 'webpack';
import path from 'path';

import config from ".//webpack/webpack.prod.mjs";

export function build() {
  // Create compiler instance
  const compiler = webpack(config);

  // Add progress plugin
  new webpack.ProgressPlugin({
    activeModules: true,
    entries: true,
  }).apply(compiler);

  // Run the compilation
  compiler.run((err, stats) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (stats.hasErrors()) {
      console.error(stats.toString('errors-only'));
      process.exit(1);
    }

    console.log(stats.toString({ colors: true }));
    compiler.close((closeErr) => {
      if (closeErr) {
        console.error(closeErr);
        process.exit(1);
      }
    });
  });
}
