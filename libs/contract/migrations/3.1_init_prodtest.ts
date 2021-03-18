import { COIN_EXP } from "../src";
import { TheCoinContract } from "./types/TheCoin";

export async function initializeProdTest(contract: TheCoinContract, _accounts: string[]) {

  // TheCoin is already the owner of the contract.
  // Lets mint 10000K and initialize BrokerCAd
  const proxy = await contract.deployed();

  console.log("Minting minty coins");
  // Ignore roles (eg minter etc) for now
  await proxy.mintCoins(10000 * COIN_EXP);

  // Send to BrokerCAD (how?);
}
