import { getSigner } from ".";
import { Wallet } from 'ethers/wallet';

it("can will return an account in each environment", async () => {
  // Default (test) env, should create random account
  const spy = jest.spyOn(Wallet, 'createRandom');
  await getSigner("BrokerCAD");
  expect(spy).toHaveBeenCalled();
});
