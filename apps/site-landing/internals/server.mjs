
import { run } from "@thecointech/site-base/internal/server";
import { join, dirname } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const csvpath = join(__dirname, '..', 'src', 'containers', 'ReturnProfile', 'data', 'sp500_monthly.csv');

run(app => {

  // serve CSV data needed by comparison graph
  const sp500buffer = readFileSync(csvpath);
  const sp500string = sp500buffer.toString();

  app.get('/sp500_monthly.csv', (req, res) => {
    res.send(sp500string);
  });
})
