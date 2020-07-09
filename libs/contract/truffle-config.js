'use strict';

module.exports = {
  networks: {
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: "^0.6.0"  // ex:  "0.4.20". (Default: Truffle's installed solc)
    }
  }
};
