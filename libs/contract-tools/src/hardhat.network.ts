// import type { Network } from '@thecointech/ethers-provider';

function getLiveNetwork(_type: string) {
  // Our providers are source-of-truth for connections to the blockchain
  // TODO: Revert to using providers if/when HardHat allows ESM modules for config files.
  // NOTE: These URLs won't work, they should be Infura urls similar to https://hardhat.org/hardhat-runner/docs/config
  const url = process.env.CONFIG_NAME === "prodtest"
   ? 'https://polygon-amoy.infura.io/v3/'
   : "https://polygon-mainnet.infura.io/v3/"

  // So, moving to secrets manager means we need an async
  // load of the project ID.  Unfortunately, HardHat does not
  // support async config files.  I'm not going to update
  // this now, as it's possible that HardHat will gain support
  // before we need to update any contracts
  // (an alternative in the future could also be to add a pre-load
  // script that loads the secrets into the environment)
  // if (!process.env.INFURA_PROJECT_ID) {
  //   throw new Error("Missing Infura project ID");
  // }
  return {
    chainId: parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!),
    url: `${url}${process.env.INFURA_PROJECT_ID}`,
  }
}
function getDevNetwork() {
  return {
    url: "http://localhost:9545",
    chainId: parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!),
    // Just too much spam in the dev:live logs
    loggingEnabled: false,
  }
}
export function getNetworks() {
  return process.env.CONFIG_NAME?.startsWith("prod")
    ? {
        polygon: getLiveNetwork("POLYGON"),
        ethereum: getLiveNetwork("ETHEREUM"),
      }
    : {
        polygon: getDevNetwork(),
        localhost: getDevNetwork(),
        hardhat: {
          loggingEnabled: false,
        }
      }
}
