'use strict';

const ds = require('./Datastore').datastore
const ethers = require('ethers')

exports.QueryPurchasesIds = function (state) {
    return new Promise((resolve, reject) => {
        const query = ds
            .createQuery('Purchase')
            .select('__key__')

        if (typeof state === 'number')
            query.filter('state', '=', state);

        ds.runQuery(query)
            .then(results => {
                var entities = results[0];
                var keys = entities.map((entity) => {
                    const key = entity[ds.KEY];
                    return key.path.join('/');
                });
                resolve(keys);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}

exports.QueryPurchaseState = function (user, id, state) {
    return new Promise((resolve, reject) => {
        const ancestorKey = ds.key(['User', user, "Purchase", id]);
        const query = ds
            .createQuery("Step")
            .hasAncestor(ancestorKey)

        ds.runQuery(query)
            .then(results => {
                var entities = results[0];
                var json = {};
                entities.forEach((entity) => {
                    const key = entity[ds.KEY];
                    if (state === undefined || key.name === state)
                        json[key.name] = entity;
                })
                resolve(json);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}

function UpdatePurchase(user, id, state, step, data) {
    // Our purchase is registered as a request, to be completed
    const key = ds.key(['User', user, 'Purchase', id, "Step", step])
    const entity = {
        key: key,
        data: data
    }
    const update = {
        key: ds.key(['User', user, 'Purchase', id]),
        data: {
            state: state
        }
    };

    // For each target, blend to it's output by the calculated weight.
    const transaction = ds.transaction();

    return transaction
        .run()
        .then(() => Promise.all([ds.insert(entity), ds.update(update)]))
        .then(results => {
            // Update/Insert was successful.
            resolve(id);
            return transaction.commit();
        })
        .catch(() => transaction.rollback());
}

exports.ConfirmPurchaseOrder = function (user, id, confirm) {
    return new Promise((resolve, reject) => {
        const message = confirm.timestamp.toString() + id.toString();
        const account = ethers.utils.verifyMessage(message, confirm.signature);

        // TODO: Verify that account here is a legitimate brokers account(?)

        return UpdatePurchase(user, id, 1, 'confirm', confirm);
    });
}

exports.CompletePurchaseOrder = function(user, id, signedComplete) {
    return new Promise((resolve, reject) => {
        
        //const account = getAccount(signedComplete.message, signedComplete.signature);
        const complete = JSON.parse(signedComplete.message)
        
        // TODO: Verify that we can regenerate the message from the JSON
        complete.signature = signedComplete.signature;

        // TODO: Verify that account here is a legitimate brokers account(?)

        return UpdatePurchase(user, id, 2, 'complete', complete);
    });
}