import { verify } from "@thecointech/contract-tools/verify";

async function verifyNft(network: string) {
  console.log(`Verifying TheGreenNFTL2 on ${network}`);
  const deployed = require(`../src/deployed/${process.env.CONFIG_NAME}-${network}`)
  verify(network, "TheGreenNFTL2", deployed.contract)
}
const network = process.argv[2];
verifyNft(network);
