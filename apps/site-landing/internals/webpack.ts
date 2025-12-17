import { getConfig } from "@thecointech/site-base/internal/webpack";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const config = await getConfig([], {
  port: 3000,
  setupMiddlewares: (middlewares, devServer) => {
    if (!devServer) {
      throw new Error('webpack-dev-server is not defined');
    }

    // Serve CSV data needed by comparison graph
    const datapath = resolve(process.cwd(), 'src', 'containers', 'BenefitsSimulator', 'simulator');
    const snpDataPath = resolve(datapath, 'sp500_monthly.csv');
    const fxDataPath = resolve(datapath, 'fx_monthly.csv');

    try {
      const snpString = readFileSync(snpDataPath, 'utf8');
      const fxString = readFileSync(fxDataPath, 'utf8');

      devServer.app?.get('/sp500_monthly.csv', (req, res) => {
        res.send(snpString);
      });
      devServer.app?.get('/fx_monthly.csv', (req, res) => {
        res.send(fxString);
      });
    } catch (e) {
      console.warn('Could not read simulator data files. This is expected for apps that do not use it.');
    }

    return middlewares;
  },
});

export default config;
