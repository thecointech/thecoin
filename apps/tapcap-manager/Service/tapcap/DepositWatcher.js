'use strict';

const GetContract = require('@the-coin/utilities/TheContract').default;
const datastore = require('./Datastore');

const ds = datastore.datastore;
const GetLatestKey = datastore.GetLatestKey;

const LastProcessedKey = ds.key(["Settings", "tapcap"]);

const contractInitBlock = 4456169; // for ROPSTEN.  TODO: UPDATE ON DEPLOY
let lastProcessedBlock = 0;

// Get the most recently processed block
async function GetProcessedBlockNumber() {
    if (lastProcessedBlock == 0) {
        lastProcessedBlock = contractInitBlock;
        const settings = await ds.get(LastProcessedKey);
        if (settings != null && settings.length > 0) {
            lastProcessedBlock = settings[0].lastBlock;
        }
    }
    return lastProcessedBlock;
}

let TCTopUpList = [];
let _currentlyProcessing = null;

function ProcessList()
{
    if (!_currentlyProcessing && TCTopUpList.length) {
        _currentlyProcessing = TCTopUpList.pop()
        _currentlyProcessing();
    }
}
async function TapCapTopUp(address, topup, event) {
    TCTopUpList.push(() => doTapCapTopUp(address, topup, event));
    ProcessList();
}

async function doTapCapTopUp(address, topup, event) {

    //const lastProcessed = await GetProcessedBlockNumber();
    const amount = topup.toNumber();
    const block = await event.getBlock();
    const tx = await event.getTransaction();
    const timestamp = block.timestamp * 1000;

    console.log("Processing deposit tx: " + tx.hash);

    // // Double check we do not miss events, or double-process them
    // if (lastProcessed >= block.number) {
    //     throw("Re-processing block: " + block.number + " for tx: " + event.transactionHash);
    // }

    // We store a separate record of the data 
    const depositKey = ds.key(["User", address, "deposit", tx.hash]);
    const latestKey = GetLatestKey(address);
    const transaction = ds.transaction();
    transaction
        .run()
        .then(() => Promise.all([transaction.get(latestKey), transaction.get(depositKey)]))
        .then((results) => {
            if (results[1][0] != null) {
                console.error("Re-processing tx, already registered: " + tx.hash);
            }
            else {
                let lastBalance = 0;
                let lastNonce = 0;
                const latestRec = results[0][0]
                if (latestRec) {
                    lastBalance = latestRec.balance;
                    lastNonce = latestRec.nonce;
                }
                const balance = lastBalance + amount;
                const nonce = lastNonce + 1;

                const txKey = ds.key(["User", address, "tx", nonce]);
        
                transaction.save([
                    {
                        key: depositKey,
                        data: {
                            blockNumber: block.number,
                            amount: amount
                        }
                    },
                    {
                        key: txKey,
                        data: {
                            change: -amount,
                            timestamp: timestamp,
                            balance: balance,
                            data: depositKey
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
                        data: {
                            lastBlock: block.number
                        }
                    }
                ]);                               
            }
            return transaction.commit();
        })
        .then(() => {
            // Trigger the next item in the list
            _currentlyProcessing = null;
            ProcessList();
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

exports.WatchTapCapDeposits = async () => {
    const theContract = GetContract();

    // Lets process all events from the last processed block until now
    const lastProcessedBlock = await GetProcessedBlockNumber();
    theContract.provider.resetEventsBlock(lastProcessedBlock + 1); // + 1 because we skip the last processed block.


    theContract.on("TapCapTopUp", TapCapTopUp);
    theContract.on("TapCapUserUpdated", TapCapUserUpdated);
}