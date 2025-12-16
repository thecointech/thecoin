
import { run } from "@thecointech/site-base/internal/server";
run(
  [],
  app => {

  // // serve CSV data needed by comparison graph
  // const snpString = readFileSync(snpDataPath, 'utf8');
  // const fxString = readFileSync(fxDataPath, 'utf8');

  // app.get('/sp500_monthly.csv', (req, res) => {
  //   res.send(snpString);
  // });
  // app.get('/fx_monthly.csv', (req, res) => {
  //   res.send(fxString);
  // });
})
