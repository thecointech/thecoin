import { BlockTag, Filter, JsonRpcProvider, Log } from '@ethersproject/providers';
import { hexZeroPad, hexStripZeros } from "@ethersproject/bytes";
import { id } from "@ethersproject/hash";
import { BigNumber } from "@ethersproject/bignumber";
import { ERC20Response } from '../erc20response';

export class Erc20Provider extends JsonRpcProvider {

  constructor() {
    super(`http://localhost:${process.env.DEPLOY_NETWORK_PORT}`);
  }

  //
  // In devlive, we do not have access to Etherscans advanced api
  // but we can replicate using just events
  async getERC20History(args: {address?: string, contractAddress?: string, startBlock?: BlockTag, endBlock?: BlockTag}) {
    const buildFilter = ([t1, t2]: [string|null, string|null]) => ({
      address: args.contractAddress,
      fromBlock: 0,
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
        value: BigNumber.from(tx.data),
      } as any;
      return result;
    });
  }

  async getEtherscanLogs(filter: Filter, _conditional: "or"|"and") : Promise<Array<Log>>{
    filter.fromBlock = 0;
    const result = await this.getLogs(filter);
    return result;
  }

  async getSourceCode(_address: string) {
    // const { getContract } = await import("@thecointech/contract-plugin-converter");

    // const uberContract = await getContract();
    // if (address == uberContract.address) {
    //   const rn = await import("@thecointech/contract-plugin-converter/contract-src.json")
    //   return rn.default.code;
    // }
    // else {
    //   const rn = await import("@thecointech/contract-core/contract-src.json")
    //   return rn.default.code;
    // }
    return "";
  }
}

export const getProvider = () => new Erc20Provider();
