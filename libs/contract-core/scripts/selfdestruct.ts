import hre from 'hardhat';
import { getSigner } from '@thecointech/signers';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { GetContract } from '../src';
import { exit } from 'process';
import { getProvider } from '@thecointech/ethers-provider';

const admin = await hre.upgrades.admin.getInstance();
const brokerCad = await getSigner("BrokerCAD");
const brokerAddress = await brokerCad.getAddress();
const owner = (await getSigner("Owner")).connect(getProvider());

// Sign the owner verfiication
const message = "[polygonscan.com 29/10/2022 22:06:28] I, hereby verify that I am the owner/creator of the address [0x34fa894d7fe1fa5fa9d109434345b47dbe3b01fc]";
const signature = await owner.signMessage(message);
console.log(signature);
exit(1);

async function pushThebutton(proxyAddress: string) {

  const ownerAddress = await owner.getAddress();
  const theCoin = await GetContract();
  if (theCoin.address == proxyAddress) {
    throw new Error("Cannot do this");
  }
  // test existing balance
  var proxy = theCoin.attach(proxyAddress);
  const initBalance = await proxy.balanceOf(brokerAddress);

  // If no BRB, deploy one
  const bigRedButton = await hre.ethers.getContractFactory("SelfDestructor", owner);
  const brbInstance = await bigRedButton.deploy(ownerAddress);
  console.log(`brb Address= ${brbInstance.address}}`);
  exit(1);
  //const brbInstance = bigRedButton.attach(brbAddress);

  // Set the current Proxy logic fn to BRB
  const owned = admin.connect(owner);
  const upgrade = await owned.upgrade(proxyAddress, brbInstance.address);
  await upgrade.wait();

  // Self-destruct the proxy
  const brbProxy = bigRedButton.attach(proxyAddress);
  const buttonPush = await brbProxy.destroyProxy();
  await buttonPush.wait();

  try {
    // The following should throw
    const balance = await proxy.balanceOf(ownerAddress);
    console.log("SELFDESTRUCT FAILED: " + balance.toString(), initBalance.toString());
  }
  catch (err) {
    console.log(`SELFDESTRUCT SUCCEEDED: ${proxyAddress}`);
  }
}

const brbAddress = "0xedE4531d812402A9E8F2845e0CE51d8664fb1bC6";

const proxyAddresses = [
  "0x14370e05b8c04315C7b64e37c0716dbf69A44ECD",
  "0x5548c17DA9e5779Ba7BBB2a8e7c739f176Cce717",
  "0x6e30e73CEa570C84fde68fE63b90Da6c9f6A0899",
  "0x5d178D4DD261Fa9385718473289951D7ce120621",
  "0x3a63D48f8FB1D9fed50a0B5FAC0eFCcfef506058",
];
for (const pa of proxyAddresses) {
  await pushThebutton(pa);
}




