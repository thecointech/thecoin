import { getSigner } from ".";
import { Wallet } from 'ethers/wallet';
import { existsSync, writeFileSync } from "fs";

it("generates random account in dev mode", async () => {
  // development env, should create random account
  process.env.NODE_ENV = 'development';
  const spy = jest.spyOn(Wallet, 'createRandom');
  await getSigner("BrokerCAD");
  expect(spy).toHaveBeenCalled();
})

it("reads account correctly from Secrets Manager", async () => {
  const prodAcc = "testing-service-acc.json";
  if (existsSync(prodAcc)) {
    jest.setTimeout(600000);
    process.env.NODE_ENV = 'production';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = prodAcc;
    const spy = jest.spyOn(Wallet, 'fromMnemonic');
    const signer = await getSigner("BrokerTransferAssistant");
    expect(signer).toBeDefined();
    expect(spy).toHaveBeenCalled();
  }
});
