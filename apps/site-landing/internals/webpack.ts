import { getConfig } from "@thecointech/site-base/internal/webpack";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import type Server from "webpack-dev-server";
import type { Configuration } from "webpack";

function getDevServer(): Partial<Configuration> {
  return (process.env.NODE_ENV === 'production')
  ? {}
  : {
    devServer: {
      port: 3000,
      setupMiddlewares: (middlewares: Server.Middleware[], devServer: Server) => {
        if (!devServer?.app) {
          throw new Error('webpack-dev-server is not defined');
        }

        // Serve CSV data needed by comparison graph
        const datapath = resolve(process.cwd(), 'src', 'containers', 'BenefitsSimulator', 'simulator');
        const snpDataPath = resolve(datapath, 'sp500_monthly.csv');
        const fxDataPath = resolve(datapath, 'fx_monthly.csv');

        let snpPromise: Promise<string>;
        devServer.app.get('/sp500_monthly.csv', async (req, res) => {
          snpPromise ??= readFile(snpDataPath, 'utf8');
          res.send(await snpPromise);
        });
        let fxPromise: Promise<string>;
        devServer.app.get('/fx_monthly.csv', async (req, res) => {
          fxPromise ??= readFile(fxDataPath, 'utf8');
          res.send(await fxPromise);
        });

        return middlewares;
      },
    }
  }
}
const config = await getConfig([], getDevServer());

export default config;
