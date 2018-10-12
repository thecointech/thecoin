'use strict';

const ethers = require('ethers');
const TheCoinSpec = require('the-contract/build/contracts/TheCoin');

const { abi } = TheCoinSpec;
const { address } = TheCoinSpec.networks[3];
const ropsten = ethers.getDefaultProvider('ropsten');

const theContract = new ethers.Contract(address, abi, ropsten);

exports.TheContract = theContract;
