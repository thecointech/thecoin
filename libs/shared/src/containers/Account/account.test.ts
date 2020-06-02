//import { GetContract } from "@the-coin/utilities/TheContract";
import { Wallet } from "ethers";
//import { Component} from 'react'; // literally anything, don't even have to use it


//import { IsDebug } from "@the-coin/utilities/IsDebug";


//const Box = require('3box')
const IdentityWallet = require('identity-wallet')
const getConsent = async () => {
    // For testing purposes a function that just returns
    // true can be used. In prodicution systems the user
    // should be prompted for input.
    return true
  }



//beforeAll(async () => {
  //firestore.init();
//});

test("Wallet initilize", async () => {
    const seed = "execute worth erode bullet donkey source second struggle budget worry network pottery" // a hex encoded seed
    const idWallet = new IdentityWallet(getConsent, { seed })
    console.log("IDWALLET",idWallet)
    console.log(Wallet)
})

