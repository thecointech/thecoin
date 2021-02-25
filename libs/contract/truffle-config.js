'use strict';
var path = require('path');

module.exports = {
  // We output into our src directory so we can directly import
  // the JSON artifacts into our TS code.
  contracts_build_directory: path.join(__dirname, "src", "deployed"),

  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
    },
    ropsten: {
      host: 'localhost',
      port: 9545,
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: "^0.6.0",  // ex:  "0.4.20". (Default: Truffle's installed solc)
      docker: false,
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       },
       evmVersion: "byzantium"
      }
    }
  }
};
