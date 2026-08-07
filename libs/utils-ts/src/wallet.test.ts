import { Wallet } from "ethers";
import { decryptWallet } from "./wallet-node";
import { it, expect } from "@jest/globals";

it("decryptWallet should work", async () => {
  const wallet = Wallet.createRandom()
  const encrypted = wallet.encryptSync("test")
  const decrypted = await decryptWallet(encrypted, "test")
  expect(decrypted.address).toEqual(wallet.address)
})
