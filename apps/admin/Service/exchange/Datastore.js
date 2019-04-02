'use strict'

const Datastore = require('@google-cloud/datastore');
const {NormalizeAddress} = require('@the-coin/utilities');

// Instantiate a datastore client
const datastore = Datastore({
    projectId: "the-broker-cad",
    namespace: 'brokerCAD'
});

exports.datastore = datastore;

const GetReferrerKey = (referrerId) => datastore.key(['Referrer', referrerId.toLowerCase()])
const GetUserKey = (address) => datastore.key(['User', NormalizeAddress(address)])

module.exports = {datastore, GetUserKey, GetReferrerKey }
