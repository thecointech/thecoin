import { BlockTag, Filter, Log } from '@ethersproject/abstract-provider';
import { ChainProvider as SrcApi } from './provider';

export class ChainProvider implements Pick<SrcApi, "getERC20History"|"getEtherscanLogs"> {
  async getERC20History(_args: { address?: string | undefined; contractAddress?: string | undefined; startBlock?: BlockTag | undefined; endBlock?: BlockTag | undefined; }): Promise<any> {
    return [];
  }
  async getEtherscanLogs(_filter: Filter, _conditional: 'or' | 'and'): Promise<Log[]> {
    return [];
  }
}
