export type MigrationStep = (artifacts: Truffle.Artifacts, web3?: Web3) => (
    _deployer: Truffle.Deployer,
    network: string,
    accounts: string[]
  ) => Promise<void>
