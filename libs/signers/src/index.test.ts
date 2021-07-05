import { getSigner } from "./index_node";
import { Wallet } from 'ethers/wallet';

it("generates random account in dev mode", async () => {
  // development env, should create random account
  process.env.NODE_ENV = 'development';
  const spy = jest.spyOn(Wallet, 'createRandom');
  await getSigner("BrokerCAD");
  expect(spy).toHaveBeenCalled();
})
