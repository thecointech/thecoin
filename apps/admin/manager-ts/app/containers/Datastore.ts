import { Datastore } from '@google-cloud/datastore';

// Instantiate a datastore client
const ds = new Datastore({
    projectId: "the-broker-cad",
    namespace: 'brokerCAD'
});

export { ds }