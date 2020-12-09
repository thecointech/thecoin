
const server = require("@the-coin/site-base/internal/server");
const path = require("path");
const fs = require("fs")

server.run(app => {

  // serve CSV data needed by comparison graph
  const csvpath = path.resolve(__dirname, '..', 'src', 'sp500_monthly.csv');
  const sp500buffer = fs.readFileSync(csvpath);
  const sp500string = sp500buffer.toString();

  app.get('/sp500_monthly.csv', (req, res) => {
    res.send(sp500string);
  });
})


