import { getSigner } from "@thecointech/accounts";
import { MigrationStep } from './types';
import "../../../tools/setenv";

const step: MigrationStep =  (artifacts) =>
  async (deployer, _network, accounts) => {
    const Migrations = artifacts.require("Migrations");

    const ownerSigner = await getSigner("Owner");
    const ownerAddress = await ownerSigner.getAddress();
    console.log("Deploying with acc: " + accounts[0])
    console.log("Deploying with acc: " + ownerAddress)
    // Deploy the Migrations contract as our only task
    deployer.deploy(Migrations);
  }

module.exports = step
