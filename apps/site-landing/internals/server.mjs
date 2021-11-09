
import { run } from "@thecointech/site-base/internal/server";
import { resolve, dirname } from "path";
import { readFileSync } from "fs";

const __dirname = dirname(new URL(import.meta.url).pathname);
run(app => {

  // serve CSV data needed by comparison graph
  const csvpath = resolve(__dirname, '..', 'src', 'sp500_monthly.csv');
  console.log(`1: __dirname\n2: ${csvpath}`);
  const sp500buffer = readFileSync(csvpath);
  const sp500string = sp500buffer.toString();

  app.get('/sp500_monthly.csv', (req, res) => {
    res.send(sp500string);
  });
})
