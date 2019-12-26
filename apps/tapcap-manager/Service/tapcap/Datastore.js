'use strict'

const Datastore = require('@google-cloud/datastore');

const ds = Datastore({
    projectId: "thecoincore-212314",
    namespace: 'tapcap'
});

// Instantiate a datastore client
exports.datastore = ds;
exports.GetLatestKey = (address) => ds.key(["User", address, "bookmark", "latest"]);