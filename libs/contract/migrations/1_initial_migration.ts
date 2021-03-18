
const step: MigrationStep =  (artifacts) =>
  async (deployer, _network, accounts) => {
    const Migrations = artifacts.require("Migrations");

    console.log("Deploying with acc: " + accounts[0])
    // Deploy the Migrations contract as our only task
    deployer.deploy(Migrations);
  }

module.exports = step
