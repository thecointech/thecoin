import { BlockTag, Filter, BaseProvider, Log } from '@ethersproject/providers';
import { hexZeroPad } from "@ethersproject/bytes";
import { BigNumber } from "@ethersproject/bignumber";
import { ERC20Response } from '../erc20response';

import transferFrom from './logs-transfer-from.json';
import transferTo from './logs-transfer-to.json';
import exactFrom from './logs-exact-from.json'
import exactTo from './logs-exact-to.json'

export class ChainProvider extends BaseProvider {

  constructor() {
    super('any')
  }

  //
  // In devlive, we do not have access to Etherscans advanced api
  // but we can replicate using just events
  async getERC20History(args: {address: string, contractAddress?: string, startBlock?: BlockTag, endBlock?: BlockTag}) {

    const remapping: any = await getRemapping(args.address);
    const result = [...transferFrom.result, ...transferTo.result];
    return result.map((tx) : ERC20Response => {
      const blockNumber = parseInt(tx.blockNumber, 16);
      return {
        blockNumber: blockNumber,
        timestamp: blockNumber,
        hash: tx.transactionHash,
        blockHash: tx.blockHash,
        contractAddress: tx.address,
        transactionIndex: tx.transactionIndex,

        from: remapping[tx.topics[1]],
        to: remapping[tx.topics[2]!],
        value: BigNumber.from(tx.data),
      } as any;
    }).sort((a, b) => a.blockNumber - b.blockNumber);

  }

  async getEtherscanLogs(filter: Filter, _conditional: "or"|"and") : Promise<Array<Log>>{
    const raw = (filter.topics?.[1] === null)
      ? exactFrom
      : exactTo;

    const clientTopic = filter.topics!.slice(1).find(t => t) as string
    const remapping: any = await getRemapping(clientTopic);
    remapping.broker = hexZeroPad(remapping.broker, 32);

    return raw.result.map(l => ({
      ...l,
      blockNumber: parseInt(l.blockNumber, 16),
      logIndex: parseInt(l.logIndex, 16),
      transactionIndex: parseInt(l.transactionIndex, 16),
      topics: l.topics.map(t => remapping[t] ?? t),
      removed: false,
    }))
  }
}

async function getRemapping(clientAddress: string) : Promise<Record<string, string>> {
  // We make this a dynamic import so we can avoid putting a dependency
  // on the signers project.
  const { getSigner } = await import('@thecointech/signers');
  const brokerCad = await getSigner('BrokerCAD');
  return {
    client: clientAddress,
    broker: await brokerCad.getAddress(),
  }
}
