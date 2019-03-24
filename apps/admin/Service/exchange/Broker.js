'use strict';

const ds = require('./Datastore').datastore
const ethers = require('ethers')
const TheContract = require('@the-coin/utilities').TheContract;
    
const tc = TheContract.GetContract();
const status = require('./status')
status.certifiedFee = parseInt(status.certifiedFee);

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

// ------------------------------------------------------------------------

const BuildSellKey = (user, id) => ds.key(['User', user, 'Sell', Number(id)])
exports.BuildSellKey = BuildSellKey;

function StoreRequest(sale, hash)
{
    // Store the verified xfer
    const user = sale.transfer.from;

    return new Promise((resolve, reject) => {
        const baseKey = ds.key(['User', user, 'Sell']);
        ds.allocateIds(baseKey, 1, function (err, keys) {
            if (err) {
                reject(err);
            }
            else {
                const saleId = keys[0];
                const saleKey = BuildSellKey(user, saleId.id);
                const entities = [
                    {
                        key: saleKey,
                        data: {
                            userSellData: sale,
                            processedTimestamp: Date.now(), 
                            hash: hash,
                            confirmed: false,
                            fiatDisbursed: 0
                        }
                    }
                ];
                ds.insert(entities).then(() => {
                    // Task inserted successfully.
                    resolve(saleId.id);
                })
                .catch((err) => {
                    reject(err);
                })
            }
        });
    });
}

async function ConfirmSale(user, xferId, tx)
{
    // Why do we wait for tow confirmations?  I don't know...
    // https://docs.ethers.io/ethers.js/html/cookbook-contracts.html?highlight=transaction
    const res = await tx.wait(2);
    console.log(`Tx ${tx.hash} mined ${res}`);

    const key = BuildSellKey(user, xferId);
    current = await ds.get(key);
    current.confirmed = res.status;

    await ds.update({
        key: key,
        data: current
    });
    console.log(`Tx Confirmed: ${res.status}`);
}

const FeeValid = (transfer) => transfer.fee == status.certifiedFee;
const AvailableBalance= async (transfer) => {
    const userBalance = await tc.balanceOf(transfer.from)
    return (userBalance.toNumber() >= (transfer.fee + transfer.value))
}
const ValidXfer = (transfer) => TheContract.GetTransferSigner(transfer) == transfer.from;
const ValidSale = (sale) => {
    var saleSigner = TheContract.GetSaleSigner(sale);
    return (saleSigner == sale.transfer.from)
}

exports.DoCertifiedSale = async function(sale) {

    const { transfer, clientEmail, signature } = sale;
    if (!transfer || !clientEmail || !signature) 
        return "Invalid arguments";

    // First check: is this the right sized fee?
    if (!FeeValid(transfer)) // TODO: Is that even remotely the right size?
        return "Invalid fee present"

    // Next, check that user have available balance
    if (!await AvailableBalance(transfer))
        return "Insufficient funds";

    // Next, verify the xfer request
    if (!ValidXfer(transfer))
        return "Invalid xfer";

    // Next, verify the email address
    if (!ValidSale(sale))
        return "Invalid email";

    const {from, to, value, fee, timestamp, signature} = transfer;
    const gasAmount = await proxy.methods.certifiedTransfer(eclient, client1, value, fee, timestamp, signature)
        .estimateGas({gas:5000000, from:eclient})
    console.log(`Tx ${from} -> ${tp}: Gas Amount ${gasAmount}`);

    let tx = tc.certifiedTransfer(from, to, value, fee, timestamp, signature).send({gas: 200000})

    // Next, create an initial record of the transaction
    const xferId = await StoreRequest(sale, tx.hash);
    console.log(`Valid Cert Xfer: id: ${xferId}`);
        
    // Wait for a second, then validate this transaction
    setTimeout(() => ConfirmSale(tx, xferId), 1000);

    // But for now, we just return the hash
    const hash = tx.hash;
    return hash;

    // For now - we will do all actual transactions manually.

    // // Next, submit the request to the contract
    // const blockHash = tc.certifiedTransfer(eclient, client1, value, fee, timestamp, signature).send({ gas: 200000 });
    // StoreHash(xferId, blockHash);

    // Wait for the transfer to be mined.

}

// ------------------------------------------------------------------------

exports.ServerStatus = () => status;