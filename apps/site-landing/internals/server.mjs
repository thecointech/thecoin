
import { run } from "@thecointech/site-base/internal/server";
import { join, dirname } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const url = import.meta.url;
const filename = fileURLToPath(url);
const localdir = dirname(filename);
const datapath = join(localdir, '..', 'src', 'containers', 'BenefitsSimulator', 'simulator');
const snpDataPath = join(datapath, 'sp500_monthly.csv');
const fxDataPath = join(datapath, 'fx_monthly.csv');

run(
  [],
  app => {

  // serve CSV data needed by comparison graph
  const snpString = readFileSync(snpDataPath, 'utf8');
  const fxString = readFileSync(fxDataPath, 'utf8');

  app.get('/sp500_monthly.csv', (req, res) => {
    res.send(snpString);
  });
  app.get('/fx_monthly.csv', (req, res) => {
    res.send(fxString);
  });
})
