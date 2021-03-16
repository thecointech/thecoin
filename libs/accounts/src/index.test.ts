import { getSigner } from ".";
import { Wallet } from 'ethers/wallet';

it("can will return an account in each environment", async () => {
  // development env, should create random account
  process.env.NODE_ENV = 'development';
  const spy = jest.spyOn(Wallet, 'createRandom');
  await getSigner("BrokerCAD");
  expect(spy).toHaveBeenCalled();
});
