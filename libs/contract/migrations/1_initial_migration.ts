import { MigrationStep } from './types';
import "../../../tools/setenv";

const step: MigrationStep =  (artifacts) =>
  async (deployer, _network) => {
    const Migrations = artifacts.require("Migrations");
    // Deploy the Migrations contract as our only task
    deployer.deploy(Migrations);
  }

module.exports = step
