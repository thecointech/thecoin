'use strict';

const Ethers = require('ethers')
const ds = require('./Datastore').datastore
const getAccount = require('./Contract').getAccount

exports.InitiatePurchase = function (signedPR) {
    return new Promise((resolve, reject) => {
        const signedMessage = signedPR.cadAmount + signedPR.email + signedPR.timestamp
        const account = getAccount(signedMessage, signedPR.signature);

        // Our purchase is registered as a request, to be completed
        const baseKey = ds.key(['User', account, 'Purchase']);
        ds.allocateIds(baseKey, 1, function (err, keys) {
            if (err)
                reject(err);
            else {
                const purchaseKey = keys[0];
                const purchaseData = {
                    state: 0
                }
                const initialKey = ds.key(['User', account, 'Purchase', Number(purchaseKey.id), "Step", "request"])
                const entities = [
                    {
                        key: purchaseKey,
                        data: purchaseData
                    },
                    {
                        key: initialKey,
                        data: signedPR
                    }
                ];
                ds.insert(entities).then(() => {
                    // Task inserted successfully.
                    resolve(purchaseKey.id);
                });
            }
        });
    })
}

exports.ConfirmSale = function (signedSell) {

}