import { JsonRpcProvider } from "ethers";

// I am not entirely sure why we do not just use the web version?
export class AutoAdvanceProvider extends JsonRpcProvider {
  async waitForTransaction(transactionHash: string, confirmations?: number | undefined, timeout?: number | undefined) {
    const r = await super.waitForTransaction(transactionHash, confirmations, timeout);
    // Every time we wait, advance the block number
    // to prevent deadlocking when waiting for confirmations
    await this.send("evm_mine", []);
    return r;
  }
}
export const getProvider = () => {

  const port = process.env.DEPLOY_NETWORK_PORT;
  if (!port)
    throw new Error(`Missing deployment port, cannot connect to localhost`);

  return new AutoAdvanceProvider(`http://localhost:${port}`);
}
