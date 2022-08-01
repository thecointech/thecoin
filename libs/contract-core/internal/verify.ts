//@ts-ignore
import { verify } from "@thecointech/contract-tools/verify";

async function verifyL2(network: string) {
  const deployed = await import(
    `../src/deployed/${process.env.CONFIG_NAME}-${network}`,
    { assert: { type: "json" } }
  );
  verify(network, "TheCoinL2", deployed.default.contract);
}

verifyL2("polygon");
