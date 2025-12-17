import { getConfig } from "@thecointech/site-base/internal/webpack";
import { readFileSync } from "node:fs";

const pluginSrcUrl = new URL("../../../libs/contract-plugins/static/deployed.json", import.meta.url);

const config = await getConfig(["PolygonscanApiKey"], {
  port: 3001,
  setupMiddlewares: (middlewares, devServer) => {
    if (!devServer) {
      throw new Error('webpack-dev-server is not defined');
    }

    devServer.app?.get('/_plugins_src', (req, res) => {
      console.log("Received request for plugins src");
      if (process.env.CONFIG_NAME === "devlive") {
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
      } else {
        // Dev mode is always "RoundNumber"
        res.status(404).send("Not Found");
      }
    });

    return middlewares;
  },
});

export default config;
