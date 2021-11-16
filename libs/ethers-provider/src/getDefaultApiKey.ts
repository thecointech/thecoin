import { errors, logger } from './logger'

export const getDefaultApiKey = (network: string) => {
  switch (network) {
    case 'optimism-testnet':
    case 'optimism-mainnet':
    case 'optimism':
    case 'arbitrum':
    case 'arbitrum-mainnet':
    case 'arbitrum-testnet':
    case 'homestead':
    case 'ethereum':
    case 'mainnet':
    case 'kovan':
    case 'ropsten':
    case 'goerli':
    case 'rinkeby':
    case 'optimism-kovan':
      return '9D13ZE7XSBTJ94N9BNJ2MA33VMAY2YPIRB'
    case 'bsc-mainnet':
    case 'bsc-testnet':
    case 'bsc':
    case 'binance':
    case 'chapel':
      return 'EVTS3CU31AATZV72YQ55TPGXGMVIFUQ9M9'
    case 'polygon-mainnet':
    case 'polygon-testnet':
    case 'polygon':
      return 'VJ6RXIGFUQ63SYQS7DN6IMM8QUA6GGY3JA'

    default:
      throw logger.makeError('unsupported network', errors.UNSUPPORTED_OPERATION, {
        network
      })
  }
}
