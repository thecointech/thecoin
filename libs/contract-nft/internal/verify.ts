//@ts-ignore
import { verify } from "@thecointech/contract-tools/verify";

async function verifyNft(network: string) {
  console.log(`Verifying TheGreenNFTL2 on ${network}`);
  const deployed = await import(
    `../src/deployed/${process.env.CONFIG_NAME}-${network}`,
    { with: { type: "json" } }
  );
  verify(network, "TheGreenNFTL2", deployed.default.contract)
}
const network = process.argv[2];
verifyNft(network);
