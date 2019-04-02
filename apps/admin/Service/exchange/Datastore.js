'use strict'

const Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
const datastore = Datastore({
    projectId: "the-broker-cad",
    namespace: 'brokerCAD'
});

exports.datastore = datastore;

const GetReferrerKey = (referrerId) => datastore.key(['Referrer', referrerId.toLowerCase()])
exports.GetReferrerKey = GetReferrerKey;
