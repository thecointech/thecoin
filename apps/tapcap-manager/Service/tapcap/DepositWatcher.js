'use strict';

const TheContract = require('./TheContract').TheContract;
const ds = require('./Datastore').datastore;

async function GetLatest(address) {
    const key = ds.key(["User", address, "tx", "latest"]);
    const results = await ds.get(key);
    if (results[0])
        return results[0];
    return {
        nonce: 0,
        balance: 0
    };
}
function TapCapTopUp(address, topup, event) {
    console.log(event);

    let latest = GetLatest(address);

}

exports.WatchTapCapDeposits = ()=> {
    const latest = GetLatest("NotWorking");
    TheContract.on("TapCapTopUp", TapCapTopUp);
}