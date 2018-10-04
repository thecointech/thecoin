'use strict';

const TheContract = require('./TheContract').TheContract;
const ds = require('./Datastore').datastore;

const GetLatestKey = (address) => ds.key(["User", address, "tx", "latest"]);

const LastProcessedKey = ds.key(["Settings", "tapcap"]);
let lastProcessedBlock = 0;
async function GetProcessedBlockNumber() {
    if (lastProcessedBlock == 0) {
        lastProcessedBlock = await ds.get(LastProcessedKey)[0] || 0;
    }
    return lastProcessedBlock;
}

async function GetLatest(address) {
    const key = ds.key(["User", address, "tx", "latest"]);
    const results = await ds.get(key);
    const timestamp = Date.now();
    if (results[0])
        return results[0];
    return {
        nonce: 0,
        balance: 0,
        timestamp: timestamp
    };
}

async function SetLatest(address, latest) {
    const entity = {
        key: GetLatestKey(address),
        data: latest,
    };

    await datastore.upsert(entity);
    return true;
}

async function TapCapTopUp(address, topup, event) {

    const lastProcessed = await GetProcessedBlockNumber();
    const amount = topup.toNumber();
    const block = await event.getBlock();
    const tx = await event.getTransaction();
    const timestamp = block.timestamp * 1000;

    console.log(tx.hash);

    // Double check we do not miss events, or double-process them
    if (lastProcessed > block.number) {
        throw("Re-processing block: " + block.number + " for tx: " + event.transactionHash);
    }

    const txKey = ds.key(["User", address, "tx", event.transactionHash]);
    const latestKey = GetLatestKey(address);
    const transaction = ds.transaction();
    transaction
        .run()
        .then(() => transaction.get(latestKey))
        .then((latest) => {
            let lastBalance = 0;
            let lastNonce = 0;
            const latestRec = latest[0]
            if (latestRec) {
                lastBalance = latestRec.balance;
                lastNonce = latestRec.nonce;
            }
            const balance = lastBalance + amount;
            const nonce = lastNonce + 1;
            transaction.save([
                {
                    key: txKey,
                    data: {
                        change: -amount,
                        blockNumber: event.blockNumber,
                        timestamp: timestamp,
                        balance: balance
                    },
                },
                {
                    key: latestKey,
                    data: {
                        nonce: nonce,
                        timestamp: timestamp,
                        balance: balance
                    },
                },
                {
                    key: LastProcessedKey,
                    data: block.number
                }
            ]);
            return transaction.commit();
        })
        .catch((err) => {
            // TODO: Add retry logic
            transaction.rollback()
            console.error("Oh No!: " + err);
        });
}

function TapCapUserUpdated(user, delta, topup) {
    // todo
}

exports.WatchTapCapDeposits = () => {
    TheContract.on("TapCapTopUp", TapCapTopUp);
    TheContract.on("TapCapUserUpdated", TapCapUserUpdated);
}