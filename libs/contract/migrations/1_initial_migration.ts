
module.exports = (artifacts: Truffle.Artifacts) => {
  return async (
    deployer: Truffle.Deployer
  ) => {
    const Migrations = artifacts.require("Migrations");

    // Deploy the Migrations contract as our only task
    deployer.deploy(Migrations);
}
}
