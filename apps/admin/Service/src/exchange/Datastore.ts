import Datastore from '@google-cloud/datastore';
import {NormalizeAddress} from '@the-coin/utilities';

// Instantiate a datastore client
const datastore = new Datastore({
    projectId: "the-broker-cad",
    namespace: 'brokerCAD'
});

const GetReferrerKey = (referrerId: string) => datastore.key(['Referrer', referrerId.toLowerCase()])
const GetUserKey = (address: string) => datastore.key(['User', NormalizeAddress(address)])

export {datastore, GetUserKey, GetReferrerKey }
