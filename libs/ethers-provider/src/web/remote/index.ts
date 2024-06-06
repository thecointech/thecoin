import { BlockTag, EtherscanPlugin, EtherscanProvider, LogParams, Network } from 'ethers'
import type { PerformActionFilter, PerformActionRequest, Signer } from 'ethers'
import { format } from '../erc20response';

//
// ATTRIBUTION:
// This class was heavily inspired by https://github.com/talentlessguy/chain-provider

const initBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0");

export class Erc20Provider extends EtherscanProvider {

  constructor() {
    // For now we exclusively use hte polygon network
    const network = process.env.DEPLOY_POLYGON_NETWORK;
    const chainId = process.env.DEPLOY_POLYGON_NETWORK_ID;
    const apiKey = process.env.POLYGONSCAN_API_KEY;

    if (!network || !apiKey || !chainId) throw new Error("Cannot use Provider without network & key");
    if (network == "matic-amoy") {
      const override = new Network(network, BigInt(chainId))
      override.attachPlugin(
        new EtherscanPlugin("https://api-amoy.polygonscan.com")
      )
      super(override, apiKey);
    }
    else {
      super(network, apiKey);
    }
  }

  async getERC20History(args: {address?: string, contractAddress?: string, fromBlock?: BlockTag, toBlock?: BlockTag}) {
    const {address, contractAddress, fromBlock, toBlock} = args;
    const params: Record<string, any> = {
      action: "tokentx",
      startblock: fromBlock ?? initBlock,
      endblock: toBlock,
      sort: "asc",
    };
    if (address) params.address = address;
    if (contractAddress) params.contractAddress = contractAddress;

    const result: any[] = await this.fetch("account", params);
    return result.map(format);
  }

  // async getEtherscanLogs(filter: DeferredTopicFilter, conditional: "or"|"and") : Promise<Array<LogParams>>{
  //   const { fromBlock, toBlock } = filter as any;
  //   const params: Record<string, any> = {
  //     action: "getLogs",
  //     address: "0x34fA894d7fE1FA5FA9d109434345B47DBe3B01fc", // filter.address,
  //     fromBlock: fromBlock ?? initBlock,
  //     toBlock,
  //     topic1_2_opr: conditional
  //   };
  //   const topics = await filter.getTopicFilter();
  //   const topicsAdded: number[] = [];
  //   if (topics) {
  //     for (let i = 0; i < topics.length; i++) {
  //       if (topics[i]) {
  //         params[`topic${i}`] = topics[i];
  //         topicsAdded.forEach(v => params[`topic${v}_${i}_opr`] = conditional)
  //         topicsAdded.push(i);
  //       }
  //     }
  //   }

  //   const result = await this.fetch("logs", params);
  //   debugger;
  //   return result;
  //   // return Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(result);
  // }

  // NOTE: Prefer contract.queryFilter vs calling this directly
  async doGetEtherscanLogs(filter: PerformActionFilter, conditional: "or"|"and") : Promise<Array<LogParams>>{
    const { fromBlock, toBlock } = filter as any;
    const params: Record<string, any> = {
      action: "getLogs",
      address: filter.address,
      fromBlock: Number(fromBlock ?? initBlock),
      toBlock: Number(toBlock) ? Number(toBlock) : "latest",
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

    // Patch bad indices returned by Amoy
    if (this.network.name == "matic-amoy") {
      if (Array.isArray(result)) {
        result.forEach(p => {
          if (p.transactionIndex == "0x") {
            p.transactionIndex = "0x0"
          }
          if (p.logIndex === '0x') {
            p.logIndex = "0x0"
          }
        })
      }
    }
    return result;
  }

  // Provide an implementation for the getLogs method
  override async _perform(req: PerformActionRequest): Promise<any>
  {
    if (req.method == "getLogs") {
      return this.doGetEtherscanLogs(req.filter, "and");
    }
    return super._perform(req)
  }

  // We define the getSigner method from BaseRpcProvider because we share
  // the type definition with devlive provider and devlive signers use it.
  getSigner(_id: number): Promise<Signer> {
    throw new Error("Cannot call getSigner on an Erc20Provider");
  }

  async getSourceCode(address: string) : Promise<string> {
    const args: Record<string, any> = {
      action: "getsourcecode",
      address,
      apikey: this.apiKey
    }

    const r: SrcCodeResponse[]  = await this.fetch("contract", args);
    const [contract] = r;
    if (contract.Proxy == "1") {
      return this.getSourceCode(contract.Implementation);
    }
    const src = contract.SourceCode;
    // For some reason the returned object is invalid JSON
    // (for prodtest anyway)
    const obj = JSON.parse(
      (src.slice(0, 2) == '{{')
      ? src.slice(1, -1)
      : src
    );
    const entries = Object.entries(obj.sources);
    const [contractSrcPair, ...rest] = entries.filter(pair => !pair[0].startsWith("@"))
    if (rest.length > 0) {
      throw new Error(`Violated assumption: More than one local contract for ${address} - ${rest.map(pair => pair[0]).join(', ')}`);
    }
    return (contractSrcPair[1] as any).content;
  }
}

type SrcCodeResponse = {
  SourceCode: string; // "
  ContractName: string; // "DAO",
  CompilerVersion: string; // "v0.3.1-2016-04-12-3ad5e82",
  OptimizationUsed: string; // "1",
  Runs: string; // "200",
  ConstructorArguments: string;
  EVMVersion: string; // "Default",
  Library: string; // "",
  LicenseType: string; // "",
  Proxy: string; // "0",
  Implementation: string; // "",
  SwarmSource: string; // ""
}

export const getProvider = () => new Erc20Provider();
export type { ERC20Response } from '../erc20response';
