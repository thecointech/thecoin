'use strict'

const Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
exports.datastore = Datastore({
    projectId: "thecoincore-212314",
    namespace: 'brokerCAD'
});