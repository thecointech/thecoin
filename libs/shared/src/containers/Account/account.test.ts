import { IdentityWallet } from 'identity-wallet';
import { Box } from '3box';

//import { IsDebug } from "@the-coin/utilities/IsDebug";

const getConsent = async () => {
  return true
}

const Box = require('3box')
const IdentityWallet = require('identity-wallet')

test("Wallet 3Box can initialize", async () => {

	  jest.setTimeout(900000);

    let idWallet = new IdentityWallet(getConsent, { seed: "0xaeeeed4f195701688705514b369a1c967d156f3cf4e9eea7ebe3717868fae82a" } )
    let threeIdProvider = idWallet.get3idProvider()
    let box = await Box.openBox(null, threeIdProvider)
    let space = await box.openSpace('TheCoin')
    //let templates = await space.private.get('transferTemplates')

    //console.log("templates",templates)
})


test("Wallet 3Box can add templates", async () => {


})