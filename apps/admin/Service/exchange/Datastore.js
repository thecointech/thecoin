'use strict'

const Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
exports.datastore = Datastore({
    projectId: "the-broker-cad",
    namespace: 'brokerCAD'
});