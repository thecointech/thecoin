'use strict';

const { GetContract } = require('@the-coin/utilities').TheContract;
//import GetContract from '@the-coin/utilities/TheContract';

// function ProcessRedemption(sourceAddress, amount, newBalance, timestamp) {
//     this.getBlock()
//     .then((block) => {
//         console.log("I saw a block!!");
//     })

//     this.getTransaction()
//     .then((transaction) => {
//         console.log("I saw a transaction!")
//     })
//     console.log(`User: ${targetAddress} just sold ${amount} coins, bringing balance to ${newBalance}`);
// }

// function ProcessPurchase(targetAddress, amount, newBalance, timestamp) {
//     console.log(`User: ${targetAddress} just bought ${amount} coins, bringing balance to ${newBalance}`);
   
//     this.getBlock()
//     .then((block) => {
//         console.log("I saw a block!!" + JSON.stringify(block));
//     })

//     this.getTransaction()
//     .then((transaction) => {
//         console.log("I saw a transaction!" + JSON.stringify(block));
//     })
// }

exports.StartListening = function() {
    // TODO!!! Process sales (requires watching)
    //let tc = GetContract();

    // tc.CoinsPurchased = ProcessPurchase,
    // tc.CoinsRedeemed = ProcessRedemption
}