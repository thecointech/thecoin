// Import first (before 3box) to ensure other packages recognize its presence
import "fake-indexeddb/auto";
import { Wallet } from "ethers";
import { Account1 } from "@the-coin/utils-testing/TestAccounts"

import { login3Box } from './index';


describe("We connect and can use 3box storage", () => {
  // Basic operations
  beforeAll(async () => {
    jest.setTimeout(60000 * 10); // 10 minutes
    process.env["RENDEZVOUS_DISABLE"] = "true";

    console.warn = (...args: any) => {
      console.log("warn", ...args)
    }
  })
  it("can connect to a local account", async () => {

    const wallet = await Wallet.fromEncryptedJson(Account1.encrypted, Account1.password);
    //const box = await initialize();
    //const box = await login3Box(account);
    //expect(box).toBeTruthy();
    console.log("here");
    const box = await login3Box(wallet);
    console.log("done");

    expect(box).toBeTruthy();
    await box.syncDone;
  })

  // I'm not sure how we'll handle remote accounts in unit testing:
  // Perhaps this will need to be left for integration testing later.
  it("can connect to a remote account", () => { })
  it("reads existing data", () => { })
  it("writes, reads, and deletes new data", () => { })
  it("can write & read back an array of objects", () => { })

  // Edge cases
  it("handles a user refusal gracefully", () => { })
})

// //const Box = require('3box')
// const IdentityWallet = require('identity-wallet')

// test("Wallet 3Box can initialize", async () => {
//   jest.setTimeout(900000);
//   let idWallet = new IdentityWallet(getConsent, { seed: "0xaeeeed4f195701688705514b369a1c967d156f3cf4e9eea7ebe3717868fae82a" })
//   let threeIdProvider = idWallet.get3idProvider()
//   //let box = await Box.openBox(null, threeIdProvider)
//   //let space = await box.openSpace('TheCoin')
//   //let templates = await space.private.get('transferTemplates')

//   console.log("threeIdProvider", threeIdProvider)
// })



// test("Wallet 3Box can add templates", async () => {
//   console.log(Wallet)

// })
