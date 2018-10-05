'use strict';

var Decrypt = require('../tapcap/Wallet').DecryptWallet;
/**
 *
 * xRequestKey String 
 * no response value expected for this operation
 **/
exports.unlock = function (xRequestKey) {
  return new Promise(function (resolve, reject) {

    Decrypt(xRequestKey)
      .then((wallet) => {
        resolve(wallet.address);
      })
      .catch((err) => {
        reject(false);
      })
  })
}
