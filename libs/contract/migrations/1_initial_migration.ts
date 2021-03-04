
const step: MigrationStep =  (artifacts) =>
  async (deployer) => {
    const Migrations = artifacts.require("Migrations");

    // Deploy the Migrations contract as our only task
    deployer.deploy(Migrations);
  }

module.exports = step
