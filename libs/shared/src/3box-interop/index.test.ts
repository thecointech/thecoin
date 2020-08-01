import { Wallet } from "ethers";

//import { IsDebug } from "@the-coin/utilities/IsDebug";

const getConsent = async () => {
  return true
}


describe("We connect and can use 3box storage", () => {
  // Basic operations
  it ("can connect to a local account", () => {})

  // I'm not sure how we'll handle remote accounts in unit testing:
  // Perhaps this will need to be left for integration testing later.
  it ("can connect to a remote account", () => {})
  it ("reads existing data", () => {})
  it ("writes, reads, and deletes new data", () => {})
  it ("can write & read back an array of objects", () => {})

  // Edge cases
  it("handles a user refusal gracefully", () => {})
})

//const Box = require('3box')
const IdentityWallet = require('identity-wallet')

test("Wallet 3Box can initialize", async () => {
	  jest.setTimeout(900000);
    let idWallet = new IdentityWallet(getConsent, { seed: "0xaeeeed4f195701688705514b369a1c967d156f3cf4e9eea7ebe3717868fae82a" } )
    let threeIdProvider = idWallet.get3idProvider()
    //let box = await Box.openBox(null, threeIdProvider)
    //let space = await box.openSpace('TheCoin')
    //let templates = await space.private.get('transferTemplates')

    console.log("threeIdProvider",threeIdProvider)
})



test("Wallet 3Box can add templates", async () => {
  console.log(Wallet)

})
