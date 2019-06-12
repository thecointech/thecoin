import Datastore from '@google-cloud/datastore';
import {NormalizeAddress, IsValidAddress, IsValidReferrerId} from '@the-coin/utilities';

// Instantiate a datastore client
const datastore = new Datastore({
    projectId: "the-broker-cad",
    namespace: 'brokerCAD'
});

function GetReferrerKey(referrerId: string) {
    if (!IsValidReferrerId(referrerId)) {
        console.error(`${referrerId} is not a valid address`);
        throw new Error("Invalid Referrer");
    }
    return datastore.key(['Referrer', referrerId.toLowerCase()])
}
function GetUserKey(address: string) {
    if (!IsValidAddress(address))
    {
        console.error(`${address} is not a valid address`);
        throw new Error("Invalid address");
    }
    return datastore.key(['User', NormalizeAddress(address)])
}

export {datastore, GetUserKey, GetReferrerKey }
