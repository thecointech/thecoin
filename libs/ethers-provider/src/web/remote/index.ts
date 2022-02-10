import { BlockTag, EtherscanProvider, Filter, Formatter, Log } from '@ethersproject/providers'
import type { Signer } from '@ethersproject/abstract-signer'
import { getNetwork } from './networks'
import { logger, errors } from './logger'
import { convert } from '../erc20response'

//
// ATTRIBUTION:
// This class was heavily inspired by https://github.com/talentlessguy/chain-provider

const initBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0");

export class Erc20Provider extends EtherscanProvider {

  constructor() {
    // For now we exclusively use hte polygon network
    const network = process.env.DEPLOY_POLYGON_NETWORK;
    const apiKey = process.env.POLYGONSCAN_API_KEY;
    if (!network || !apiKey) throw new Error("Cannot use Provider without network & key");

    const standardNetwork = getNetwork(network);
    switch (standardNetwork?.name) {
      case 'optimism-mainnet':
      case 'optimism-testnet':
      case 'bsc-mainnet':
      case 'bsc-testnet':
      case 'polygon-mainnet':
      case 'polygon-testnet':
      case 'arbitrum-mainnet':
      case 'arbitrum-testnet':

      // aliases
      case 'optimism':
      case 'optimism-kovan':
      case 'bsc':
      case 'binance':
      case 'polygon':
      case 'arbitrum':
      case 'mumbai':
      case 'chapel':

      // standard networks
      case 'homestead':
      case 'ethereum':
      case 'mainnet':
      case 'kovan':
      case 'ropsten':
      case 'goerli':
      case 'rinkeby':
        break
      default:
        throw logger.makeError('unsupported network', errors.UNSUPPORTED_OPERATION, {
          network
        })
    }

    super(standardNetwork, apiKey)
  }
  isCommunityResource(): boolean {
    return false;
  }
  getBaseUrl() :string {
    switch (this.network.name) {
      case 'optimism-mainnet':
      case 'optimism':
        return 'https://api.explorer.optimism.io'
      case 'optimism-testnet':
      case 'optimism-kovan':
        return 'https://api.kovan.optimism.io'
      case 'bsc-mainnet':
      case 'bsc':
        return 'http://api.bscscan.com'
      case 'bsc-testnet':
        return 'http://api-testnet.bscscan.com'
      case 'polygon-mainnet':
      case 'polygon':
        return 'https://api.polygonscan.com'
      case 'polygon-testnet':
      case 'mumbai':
        return 'https://api-testnet.polygonscan.com'
      case 'arbitrum-mainnet':
      case 'arbitrum':
        return 'https://api.arbiscan.io'
      case 'arbitrum-testnet':
      case 'arbitrum-rinkeby':
        return 'https://api.rinkeby-explorer.arbitrum.io'
      case 'homestead':
        return 'https://api.etherscan.io'

      case 'ropsten':
        return 'https://api-ropsten.etherscan.io'

      case 'rinkeby':
        return 'https://api-rinkeby.etherscan.io'

      case 'kovan':
        return 'https://api-kovan.etherscan.io'

      case 'goerli':
        return 'https://api-goerli.etherscan.io'
    }
    throw logger.makeError('unsupported network', errors.UNSUPPORTED_OPERATION, {
      network: this.network.name
    })
  }

  async getERC20History(args: {address?: string, contractAddress?: string, startBlock?: BlockTag, endBlock?: BlockTag}) {
    const {address, contractAddress, startBlock, endBlock} = args;
    const params: Record<string, any> = {
      action: "tokentx",
      startblock: ((startBlock == null) ? initBlock : startBlock),
      endblock: ((endBlock == null) ? 99999999 : endBlock),
      sort: "asc",
    };
    if (address) params.address = address;
    if (contractAddress) params.contractAddress = contractAddress;

    const result: any[] = await this.fetch("account", params);

    return result.map(tx => {
      if (!tx.timestamp) tx.timestamp = tx.timeStamp
      const result = convert(tx);
      return result;
    });
  }

  async getEtherscanLogs(filter: Filter, conditional: "or"|"and") : Promise<Array<Log>>{
    const { startBlock, endBlock } = filter as any;
    const params: Record<string, any> = {
      action: "getLogs",
      address: filter.address,
      startblock: !startBlock ? initBlock : startBlock,
      endblock: !endBlock ? 99999999 : endBlock,
      topic1_2_opr: conditional
    };
    const topicsAdded: number[] = [];
    if (filter.topics) {
      for (let i = 0; i < filter.topics.length; i++) {
        if (filter.topics[i]) {
          params[`topic${i}`] = filter.topics[i];
          topicsAdded.forEach(v => params[`topic${v}_${i}_opr`] = conditional)
          topicsAdded.push(i);
        }
      }
    }

    const result = await this.fetch("logs", params);

    return Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(result);
  }

  // We define the getSigner method from BaseRpcProvider because we share
  // the type definition with devlive provider and devlive signers use it.
  getSigner(_id: number): Promise<Signer> {
    throw new Error("Cannot call getSigner on an Erc20Provider");
  }
}

export const getProvider = () => new Erc20Provider();
export type { ERC20Response } from '../erc20response';
