import { run } from "@thecointech/site-base/internal/server";
import { readFileSync } from "node:fs";

const pluginSrcUrl = new URL("../../../libs/contract-plugins/static/deployed.json", import.meta.url);
run(
  ["PolygonscanApiKey"],
  app => {
    // Serve dev:live plugins src
    app.get('/_plugins_src', (req, res) => {
      if (process.env.CONFIG_NAME == "dev:live") {
        const raw = readFileSync(pluginSrcUrl);
        res.send(raw);
      } else {
        // Dev mode is always "RoundNumber"
        res.status(404).send("Not Found");
      }
    });
  }
);
