export const getDeployed = (artifacts: Truffle.Artifacts) => {
  const theCoin = artifacts.require("TheCoin");
  return theCoin.deployed();
}
