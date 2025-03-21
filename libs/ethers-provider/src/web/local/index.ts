import { BlockTag, Filter, JsonRpcProvider, Log, TransactionReceipt, zeroPadValue, id } from 'ethers';
import { sleep } from '@thecointech/async'
import { ERC20Response } from '../erc20response';
import { getSourceCode } from '../plugins_devlive';

export class Erc20Provider extends JsonRpcProvider {

  constructor() {
    super(`http://127.0.0.1:${process.env.DEPLOY_NETWORK_PORT}`);
    this.pollingInterval = 250;
  }

  override async waitForTransaction(transactionHash: string, confirmations?: number | undefined, timeout?: number | undefined): Promise<null | TransactionReceipt> {
    this.autoMine(transactionHash, confirmations);
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
  async autoMine(hash: string, confirmations: number = 1) {
    if (!this.blockchainAdvance) {

      // How many confirmations do we already have?
      const tx = await this.getTransaction(hash);
      const txConfirmed = await tx?.confirmations();
      const required = confirmations - (txConfirmed ?? 0);
      if (required > 0) {
        // switch to automine to avoid deadlocking
        this.blockchainAdvance ??= new Promise<void>(async resolve => {
          await this.send("evm_setIntervalMining", [100]);
          await sleep((confirmations + 1) * 100);
          await this.send("evm_setAutomine", [true]);

          // Clear this promise
          this.blockchainAdvance = null;
          resolve();
        })
      }
    }
  }
}

const toAddress = (x: string) => x.replace(/^(0x)?0+(.{40})$/, '$1$2');

export const getProvider = () => Promise.resolve(new Erc20Provider());
