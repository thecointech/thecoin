import { BlockTag, EtherscanProvider } from '@ethersproject/providers'
import type { Networkish, Network } from '@ethersproject/providers'
import { getNetwork } from './networks'
import { logger, errors } from './logger'
import { getDefaultApiKey } from './getDefaultApiKey'
import { convert, ERC20Response } from './erc20response'

export class ChainProvider extends EtherscanProvider {

  constructor(network?: Networkish, apiKey?: string) {
    const standardNetwork = getNetwork(network == null ? 'optimism-mainnet' : network)

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

    super(<Network>standardNetwork, apiKey || getDefaultApiKey(standardNetwork.name))
  }
  isCommunityResource(): boolean {
    return this.apiKey === getDefaultApiKey(this.network.name)
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

  async getERC20History(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag) {
    const params = {
      action: "tokentx",
      address: (await this.resolveName(addressOrName)),
      startblock: ((startBlock == null) ? 0 : startBlock),
      endblock: ((endBlock == null) ? 99999999 : endBlock),
      sort: "asc"
    };

    const result = await this.fetch("account", params);

    return result.map((tx: any) : ERC20Response => {
      if (!tx.timestamp) tx.timestamp = tx.timeStamp
      const result = convert(tx);
      return result;
    });
  }
}
