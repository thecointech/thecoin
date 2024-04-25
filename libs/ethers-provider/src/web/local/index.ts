import { BlockTag, Filter, JsonRpcProvider, Log, TransactionReceipt } from 'ethers';
import { hexZeroPad, hexStripZeros } from "ethers";
import { id } from "ethers";
import { ERC20Response } from '../erc20response';
import { getSourceCode } from '../plugins_devlive';

export class Erc20Provider extends JsonRpcProvider {

  constructor() {
    super(`http://localhost:${process.env.DEPLOY_NETWORK_PORT}`);
  }

  async waitForTransaction(transactionHash: string, confirmations?: number | undefined, timeout?: number | undefined): Promise<null | TransactionReceipt> {
    const r = await super.waitForTransaction(transactionHash, confirmations, timeout);
    // Every time we wait, advance the block number
    // to prevent deadlocking when waiting for confirmations
    await this.send("evm_mine", []);
    return r;
  }

  //
  // In devlive, we do not have access to Etherscans advanced api
  // but we can replicate using just events
  async getERC20History(args: {address?: string, contractAddress?: string, fromBlock?: BlockTag, toBlock?: BlockTag}) {
    const buildFilter = ([t1, t2]: [string|null, string|null]) => ({
      address: args.contractAddress,
      fromBlock: args.fromBlock,
      toBlock: args.toBlock,
      topics: [
        id('Transfer(address,address,uint256)'),
        t1 ? hexZeroPad(args.address!, 32) : null,
        t2 ? hexZeroPad(args.address!, 32) : null,
      ]
    })

    const from = await this.getLogs(buildFilter([args.address!, null]));
    const to = await this.getLogs(buildFilter([null, args.address!]));
    const result = [...from, ...to].sort((a, b) => a.blockNumber - b.blockNumber);

    return result.map((tx: any) : ERC20Response => {
      if (!tx.timestamp) tx.timestamp = tx.timeStamp
      const result: ERC20Response = {
        blockNumber: Number(tx.blockNumber),
        // Not present on this
        timestamp: Number(tx.blockNumber),
        hash: tx.transactionHash,
        blockHash: tx.blockHash,
        contractAddress: tx.address,
        transactionIndex: tx.transactionIndex,

        from: hexStripZeros(tx.topics[1]),
        to: hexStripZeros(tx.topics[2]),
        value: BigInt(tx.data),
      } as any;
      return result;
    });
  }

  async getEtherscanLogs(filter: Filter, _conditional: "or"|"and") : Promise<Array<Log>>{
    filter.fromBlock = 0;
    const result = await this.getLogs(filter);
    return result;
  }

  getSourceCode(address: string) {
    return getSourceCode({address});
  }
}

export const getProvider = () => new Erc20Provider();
