import { getConfig } from "@thecointech/site-base/internal/webpack";
import { readFileSync } from "node:fs";
import { getSigner } from "@thecointech/signers";
import type Server from 'webpack-dev-server';
import webpack, { type Configuration } from 'webpack';


// Helper to load TestDemoAccount wallet for prodtest builds
async function getTestDemoAccountWallet(): Promise<Partial<Configuration>> {
  if (process.env.CONFIG_NAME !== 'prodtest') {
    return {};
  }

  let walletJson = process.env.PRODTEST_TESTDEMOACCOUNT_WALLET;
  if (!walletJson) {
    // This should only run on a local build.
    const signer: any = await getSigner("TestDemoAccount");
    // Clear out any properties we don't want in the public site.
    delete signer.privateKey;
    delete signer.mnemonic;
    delete signer.provider;
    delete signer.chainCode;
    delete signer.fingerprint;
    delete signer.parentFingerprint;
    // Double-stringify: first to get JSON, second to make it a string literal for DefinePlugin
    walletJson = JSON.stringify(signer);
  }
  return {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.PRODTEST_TESTDEMOACCOUNT_WALLET': JSON.stringify(walletJson),
      })
    ]
  }
}

function getDevServer(): Partial<Configuration> {
  const pluginSrcUrl = new URL("../../../libs/contract-plugins/static/deployed.json", import.meta.url);

  return (process.env.NODE_ENV === 'production')
    ? {}
    : {
      devServer: {
        port: 3001,
        setupMiddlewares: (middlewares, devServer: Server) => {
          if (!devServer?.app) {
            throw new Error('webpack-dev-server is not defined');
          }

          devServer.app.get('/_plugins_src', (req, res) => {
            console.log("Received request for plugins src");
            if (process.env.CONFIG_NAME === "devlive") {
              try {
                const raw = readFileSync(pluginSrcUrl);
                res.send(raw);
              } catch (error) {
                console.error("Failed to read plugins src file:", error);
                res.status(500).send("Internal Server Error");
              }
            } else {
              res.status(404).send("Not Found");
            }
          });
          return middlewares;
        },
      }
    }
}

const injectedSigner = await getTestDemoAccountWallet();
let config;
try {
config = await getConfig(["PolygonscanApiKey"], {
  ...getDevServer(),
  ...injectedSigner,
});
console.log("Loaded config");
} catch (error) {
  console.error("Failed to load config:", error);
}

export default config;
