// Add the web3 node module
var Web3 = require('web3');

// Show web3 where it needs to look for the Ethereum node.
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/3Ph3BvTtfMZn32IZ8jhk"));

function GetWeb3() { return web3; }

export default GetWeb3;
