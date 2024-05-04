import { BlockTag, Filter, JsonRpcProvider, Log, TransactionReceipt, zeroPadValue, id } from 'ethers';
import { sleep } from '@thecointech/async'
import { ERC20Response } from '../erc20response';
import { getSourceCode } from '../plugins_devlive';

export class Erc20Provider extends JsonRpcProvider {

  constructor() {
    super(`http://localhost:${process.env.DEPLOY_NETWORK_PORT}`);
  }

  override async waitForTransaction(transactionHash: string, confirmations?: number | undefined, timeout?: number | undefined): Promise<null | TransactionReceipt> {
    this.autoMine(confirmations);
    return await super.waitForTransaction(transactionHash, confirmations, timeout);
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
        t1 ? zeroPadValue(args.address!, 32) : null,
        t2 ? zeroPadValue(args.address!, 32) : null,
      ]
    })

    const from = await this.getLogs(buildFilter([args.address!, null]));
    const to = await this.getLogs(buildFilter([null, args.address!]));
    const result = [...from, ...to].sort((a, b) => a.blockNumber - b.blockNumber);

    return result.map((tx: any) => {
      const result: ERC20Response = {
        ...tx,
        // Not present on this
        timestamp: Number(tx.blockNumber),
        hash: tx.transactionHash,
        contractAddress: tx.address,

        from: toAddress(tx.topics[1]),
        to: toAddress(tx.topics[2]),
        value: BigInt(tx.data),
      };
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

  blockchainAdvance: Promise<void>|null = null;
  autoMine(confirmations: number = 1) {
    // Every time we wait, advance the block number
    // to prevent deadlocking when waiting for confirmations
    this.blockchainAdvance ??= new Promise<void>(async resolve => {
      for (let i = 0; i < confirmations; i++) {
        await this.send("evm_mine", []);
        await sleep(1000);
      }
      // Clear this promise
      this.blockchainAdvance = null;
      resolve();
    })
  }
}

const toAddress = (x: string) => x.replace(/^(0x)?0+(.{40})$/, '$1$2');

export const getProvider = () => new Erc20Provider();
