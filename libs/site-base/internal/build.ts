import webpack from 'webpack';
import { getProdConfig } from "./webpack/webpack.prod.mjs";
import type { SecretKeyType } from '@thecointech/secrets';

export async function build(secrets: SecretKeyType[]=[]) {
  // Create compiler instance
  const config = await getProdConfig(secrets);
  const compiler = webpack(config);

  // Add progress plugin only in non-CI environments
  if (!process.env.CI) {
    new webpack.ProgressPlugin({
      activeModules: true,
      entries: true,
    }).apply(compiler);
  }

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
