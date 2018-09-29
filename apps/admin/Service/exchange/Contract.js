'use strict';


const Ethers = require('ethers')
const Datastore = require('@google-cloud/datastore');

const TheCoinSpec = require('../contracts/TheCoin')

const abi = TheCoinSpec.abi;
const address = TheCoinSpec.networks[3].address;
const ropsten = Ethers.providers.getDefaultProvider('ropsten');

let theContract = undefined;


function ProcessRedemption(sourceAddress, amount, newBalance, timestamp) {
    this.getBlock()
    .then((block) => {
        console.log("I saw a block!!");
    })

    this.getTransaction()
    .then((transaction) => {
        console.log("I saw a transaction!")
    })
    console.log(`User: ${targetAddress} just sold ${amount} coins, bringing balance to ${newBalance}`);
}

function ProcessPurchase(targetAddress, amount, newBalance, timestamp) {
    console.log(`User: ${targetAddress} just bought ${amount} coins, bringing balance to ${newBalance}`);
   
    this.getBlock()
    .then((block) => {
        console.log("I saw a block!!" + JSON.stringify(block));
    })

    this.getTransaction()
    .then((transaction) => {
        console.log("I saw a transaction!" + JSON.stringify(block));
    })
}

exports.StartListening = function() {
    theContract = new Ethers.Contract(address, abi, ropsten);

    theContract.CoinsPurchased = ProcessPurchase,
    theContract.CoinsRedeemed = ProcessRedemption
}

exports.getAccount = function(data, signature) {
    return Ethers.Wallet.verifyMessage(data, signature);
}
