import { getSigner } from "@thecointech/accounts";
import { COIN_EXP, ConnectContract } from "../src";

// Because we don't know where the system is deploying to,
// or where our accounts are coming from, we cannot
export async function initializeTestNet() {

  const tcSigner = await getSigner("TheCoin");
  const tc = await ConnectContract(tcSigner);
  const mintSigner = await getSigner("Minter");
  const mint = await ConnectContract(mintSigner);
  const policeSigner = await getSigner("Police");
  const police = await ConnectContract(policeSigner);

  const bcSigner = await getSigner("BrokerCAD");

  // Assign Roles, currently assigned to TheCoin
  console.log("Assigning Roles...");
  const tcAddr = await tcSigner.getAddress();
  const roles = await tc.getRoles();
  console.log(`TC: ${tcAddr} - Current: ${roles}`);
  console.log(`Contract: ${tc.address}`);
  const mintAddr = await mintSigner.getAddress();
  console.log('starting');
  await tc.setMinter(mintAddr);
  console.log('Set Minter');
  await mint.acceptMinter();
  console.log('Accepted');
  const plcAddr = await policeSigner.getAddress();
  await tc.setPolice(plcAddr);
  await police.acceptPolice();

  // For testnet: we immediately mint 10K coins
  console.log("Minting coins");
  const balance = 10000 * COIN_EXP;
  await mint.mintCoins(balance);

  // The coins are all in TheCoin's account.  Lets move them to BrokerCAD
  console.log("Transfer to BrokerCAD");
  const bcAddr = await bcSigner.getAddress();
  const timestamp = Math.floor(Date.now() / 1000);
  tc.coinPurchase(bcAddr, balance, 0, timestamp);

  // And that is it :-)
  // Assign
  // Get minter acc:
  // TheCoin is already the owner of the contract.
  // Lets mint 10000K and initialize BrokerCAd
  // const proxy = await contract.deployed();

  // Ignore roles (eg minter etc) for now

  // Send to BrokerCAD (how?);
}
