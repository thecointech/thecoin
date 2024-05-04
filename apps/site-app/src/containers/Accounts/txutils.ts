import { log } from "@thecointech/logging";
import { Provider } from "ethers";

//
export async function waitTx(provider: Provider|null|undefined, hash: string, setTimedOut: (b: boolean) => void, setPercentComplete: (n: number) => void) {
  setPercentComplete(0.5);
  try {
    const tx = await provider?.waitForTransaction(hash, 2, 15 * 1000);
    return tx?.status == 1;
  }
  catch (e: any) {
    if (e.code == 'TIMEOUT') {
      log.warn(`Transaction timeout: ${hash}`);
      setTimedOut(true);
      return true;
    }
    throw e;
  }
  finally {
    setPercentComplete(1);
  }
}
