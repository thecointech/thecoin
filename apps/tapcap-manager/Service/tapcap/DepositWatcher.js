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
        if (settings != null && settings.length > 0 && settings[0] != undefined) {
            lastProcessedBlock = settings[0].lastBlock;
        }
    }
    return lastProcessedBlock;
}

const MAX_ATTEMPTS = 5;
const ATTEMPT_FAILED_BACKOFF = 1500; // backoff 1.5 seconds
let TCTopUpList = [];
let _currentlyProcessing = null;

function ProcessList()
{
    if (!_currentlyProcessing && TCTopUpList.length) {
        _currentlyProcessing = TCTopUpList.pop()
        // Currently processing itself will call processlist to make this loop
        _currentlyProcessing();
    }
}
async function TapCapTopUp(address, topup, event) {
    let topUp = () => makeTapCapTopUp(address, topup, event);
    topUp.attempts = 0;
    TCTopUpList.push(topUp);
    ProcessList();
}

async function makeTapCapTopUp(address, topup, event) {

    const amount = topup.toNumber();
    const block = await event.getBlock();
    const tx = await event.getTransaction();
    const hash = tx.hash;
    const blockNumber = block.number;
    const timestamp = block.timestamp * 1000;

    return await doTapCapTopUp(address, amount, hash, blockNumber, timestamp);
}

async function doTapCapTopUp(address, amount, hash, blockNumber, timestamp)
{
    console.log("Processing deposit tx: " + hash);

    lastProcessedBlock = Math.max(lastProcessedBlock, blockNumber);

    // // Double check we do not miss events, or double-process them
    // if (lastProcessed >= blockNumber) {
    //     throw("Re-processing block: " + blockNumber + " for tx: " + event.transactionHash);
    // }

    // We store a separate record of the data 
    const depositKey = ds.key(["User", address, "deposit", hash]);
    const latestKey = GetLatestKey(address);
    const transaction = ds.transaction();
    return transaction
        .run()
        .then(() => Promise.all([transaction.get(latestKey), transaction.get(depositKey)]))
        .then((results) => {
            if (results[1][0] != null) {
                console.error("Re-processing tx, already registered: " + hash);
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
                const latestBlock = Math.max()

                const txKey = ds.key(["User", address, "tx", nonce]);
        
                transaction.save([
                    {
                        key: depositKey,
                        data: {
                            blockNumber: blockNumber,
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
                            lastBlock: lastProcessedBlock
                        }
                    }
                ]);                               
            }
            return transaction.commit();
        })
        .then(() => {
            // Trigger the next item in the list
            _currentlyProcessing = null;
            console.log('Tx successfully inserted');
            ProcessList();
        })
        .catch((err) => {
            transaction.rollback()
            console.error("Oh No!: " + err);
            if (_currentlyProcessing.attempts < MAX_ATTEMPTS)
            {
                TCTopUpList.push(_currentlyProcessing);
                setTimeout(ProcessList, ATTEMPT_FAILED_BACKOFF * _currentlyProcessing.attempts);
            }
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

if (process.env.NODE_ENV === 'test') {
    exports.doTapCapTopUp = doTapCapTopUp;
    exports.TCTopUpList = TCTopUpList
}
else if (process.env.DATASTORE_EMULATOR_HOST !== undefined)
{
    // Add some $$$ to my personal account.  This is the 
    // easiest way to fund an account on the development server.
    let ts = new Date().getTime();
    let autoTopMeUp = () => doTapCapTopUp("0x8B40D01D2bcFFef5CF3441a8197cD33e9eD6e836", 100000000, "123456789", 123456789, ts);

    autoTopMeUp.attempts = 0;
    TCTopUpList.push(autoTopMeUp);
    setTimeout(ProcessList, 10000);
}