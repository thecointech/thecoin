const express = require('express');
const bodyParser = require('body-parser');
const { GetTransactions } = require('./datastore/GetTx')

// deepcode ignore DisablePoweredBy: Unused code (remove this disable though if we ever use this), file deepcode ignore UseCsurfForExpress: <please specify a reason of ignoring this>
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/api/tx/getAll', async (req, res) => {
  var allTx = await GetTransactions();
  res.send(allTx);
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  // deepcode ignore XSS: Currently unused code (not sure when it would be re-created)
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));
