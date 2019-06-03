'use strict';

const ds = require('./Datastore').datastore
const utilities = require('@the-coin/utilities');
const { TheContract, NormalizeAddress } = utilities;
const Wallet = require('./Wallet')
const status = require('./status.json')

//const CertifiedFee = parseInt(status.certifiedFee);

//status.address = utilities.NormalizeAddress(status.address);

// exports.QueryPurchasesIds = function (state) {
//     return new Promise((resolve, reject) => {
//         const query = ds
//             .createQuery('Purchase')
//             .select('__key__')

//         if (typeof state === 'number')
//             query.filter('state', '=', state);

//         ds.runQuery(query)
//             .then(results => {
//                 var entities = results[0];
//                 var keys = entities.map((entity) => {
//                     const key = entity[ds.KEY];
//                     return key.path.join('/');
//                 });
//                 resolve(keys);
//             })
//             .catch((error) => {
//                 console.error(error);
//                 reject(error);
//             });
//     });
// }

// exports.QueryPurchaseState = function (user, id, state) {
//     return new Promise((resolve, reject) => {
//         const ancestorKey = ds.key(['User', user, "Purchase", id]);
//         const query = ds
//             .createQuery("Step")
//             .hasAncestor(ancestorKey)

//         ds.runQuery(query)
//             .then(results => {
//                 var entities = results[0];
//                 var json = {};
//                 entities.forEach((entity) => {
//                     const key = entity[ds.KEY];
//                     if (state === undefined || key.name === state)
//                         json[key.name] = entity;
//                 })
//                 resolve(json);
//             })
//             .catch((error) => {
//                 console.error(error);
//                 reject(error);
//             });
//     });
// }

// function UpdatePurchase(user, id, state, step, data) {
//     // Our purchase is registered as a request, to be completed
//     const key = ds.key(['User', user, 'Purchase', id, "Step", step])
//     const entity = {
//         key: key,
//         data: data
//     }
//     const update = {
//         key: ds.key(['User', user, 'Purchase', id]),
//         data: {
//             state: state
//         }
//     };

//     // For each target, blend to it's output by the calculated weight.
//     const transaction = ds.transaction();

//     return transaction
//         .run()
//         .then(() => Promise.all([ds.insert(entity), ds.update(update)]))
//         .then(results => {
//             // Update/Insert was successful.
//             resolve(id);
//             return transaction.commit();
//         })
//         .catch(() => transaction.rollback());
// }

// exports.ConfirmPurchaseOrder = function (user, id, confirm) {
//     return new Promise((resolve, reject) => {
//         const message = confirm.timestamp.toString() + id.toString();
//         const account = ethers.utils.verifyMessage(message, confirm.signature);

//         // TODO: Verify that account here is a legitimate brokers account(?)

//         return UpdatePurchase(user, id, 1, 'confirm', confirm);
//     });
// }

// exports.CompletePurchaseOrder = function(user, id, signedComplete) {
//     return new Promise((resolve, reject) => {
        
//         //const account = getAccount(signedComplete.message, signedComplete.signature);
//         const complete = JSON.parse(signedComplete.message)
        
//         // TODO: Verify that we can regenerate the message from the JSON
//         complete.signature = signedComplete.signature;

//         // TODO: Verify that account here is a legitimate brokers account(?)

//         return UpdatePurchase(user, id, 2, 'complete', complete);
//     });
// }
// ------------------------------------------------------------------------

const success = (val) => {
    return {
        message : "Success",
        txHash: val
    }
}
const failure = (val) => {
    return {
        message : val,
        txHash: false
    }
}

const FeeValid = (transfer) => transfer.fee == status.certifiedFee;
const AvailableBalance= async (transfer) => {
    const userBalance = await TheContract.GetContract().balanceOf(transfer.from)
    return (userBalance.toNumber() >= (transfer.fee + transfer.value))
}
const ValidXfer = (transfer) => TheContract.GetTransferSigner(transfer) == transfer.from;

async function DoCertifiedTransferWaitable(transfer) {

    // First check: is this the right sized fee?
    if (!FeeValid(transfer)) // TODO: Is that even remotely the right size?
        return failure("Invalid fee present")

    // Next, verify the xfer request
    if (!ValidXfer(transfer))
        return failure("Invalid xfer");

    // Next, check that user have available balance
    if (!await AvailableBalance(transfer))
        return failure("Insufficient funds");

    const {from, to, value, fee, timestamp } = transfer;
    const tc = await Wallet.GetContract();
    const gasAmount = await tc.estimate.certifiedTransfer(from, to, value, fee, timestamp, transfer.signature)
    console.log(`Tx ${from} -> ${to}: Gas Amount ${gasAmount.toString()}`);
    let tx = await tc.certifiedTransfer(from, to, value, fee, timestamp, transfer.signature);
    console.log(`TxHash: ${tx.hash}`);
    // Return the full tx
    return tx;
}

// ------------------------------------------------------------------------

const BuildSellKey = (user, id) => ds.key(['User', user, 'Sell', Number(id)])

// Store the xfer info
async function StoreRequest(sale, hash)
{
    const user = sale.transfer.from;
    const baseKey = ds.key(['User', user, 'Sell']);
    const [keys] = await ds.allocateIds(baseKey, 1);

    const saleId = keys[0];
    const saleKey = BuildSellKey(user, saleId.id);
    const entities = [
        {
            key: saleKey,
            data: {
                ...sale,
                processedTimestamp: Date.now(), 
                hash: hash,
                confirmed: false,
                fiatDisbursed: 0
            }
        }
    ];
    await ds.insert(entities)
    return saleKey;
}

async function ConfirmSale(tx, saleKey)
{
    // Wait for two confirmations.  This makes it more
    // difficult for an external actor to feed us false info
    // https://docs.ethers.io/ethers.js/html/cookbook-contracts.html?highlight=transaction
    const res = await tx.wait(2);
    console.log(`Tx ${tx.hash} mined ${res.blockNumber}`);

    let [current] = await ds.get(saleKey);
    current.confirmed = res.status;

    await ds.update({
        key: saleKey,
        data: current
    });
    console.log(`Tx Confirmed: ${res.status}`);
}


const ValidSale = (sale) => {
    var saleSigner = TheContract.GetSaleSigner(sale);
    return (NormalizeAddress(saleSigner) == NormalizeAddress(sale.transfer.from))
}
const ValidDestination = (transfer) => 
    NormalizeAddress(transfer.to) == NormalizeAddress(status.address);

async function  DoCertifiedSale(sale) {
    const { transfer, clientEmail, signature } = sale;
    if (!transfer || !clientEmail || !signature) 
        return failure("Invalid arguments");
    
    console.log(`Cert Sale from ${clientEmail}`);
    
    // First, verify the email address
    if (!ValidSale(sale))
        return failure("Invalid data");

    // Finally, verify that the transfer recipient is the Broker CAD
    if (!ValidDestination(transfer))
        return failure("Invalid Destination");

    // Do the CertTransfer, this should transfer Coin to our account
    const res = await DoCertifiedTransferWaitable(transfer);
    // If we have no hash, it's probably an error message
    if (!res.hash)
        return res;

    // Next, create an initial record of the transaction
    const saleKey = await StoreRequest(sale, res.hash);
    console.log(`Valid Cert Xfer: id: ${saleKey.id}`);
        
    // Fire & Forget callback waits for res to be mined & updates DB
    ConfirmSale(res, saleKey);

    // We just return the hash
    return success(res.hash);
}

// ------------------------------------------------------------------------
exports.BuildSellKey = BuildSellKey;
exports.DoCertifiedTransfer = async (transfer) => {
    const res = await DoCertifiedTransferWaitable(transfer);
    return (res.hash) ? success(res.hash) : res;
}
exports.DoCertifiedSale = DoCertifiedSale,
exports.ServerStatus = () => status
