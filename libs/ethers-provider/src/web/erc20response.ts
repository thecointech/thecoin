import { Formatter } from 'ethers';
import { BigNumber } from 'ethers';

export interface ERC20Response {

  blockNumber: number;
  timestamp: number;
  hash: string;
  nonce: number;
  blockHash: string;
  contractAddress: string;

  to: string;
  from: string;
  value: BigNumber;

  tokenName: string,
  tokenSymbol: string,
  tokenDecimal: number,
  transactionIndex: number,

  gas: BigNumber,
  gasPrice: BigNumber,
  gasUsed: BigNumber,
}

const formatter = new Formatter();
const f_address = formatter.address.bind(formatter);
const f_bigNumber = formatter.bigNumber.bind(formatter);
const f_hash = formatter.hash.bind(formatter);
const f_number = formatter.number.bind(formatter);

const f_string = (s: string) => s
const erc20formatter = {
  blockNumber: f_number,
  timestamp: f_number,
  hash: f_hash,
  nonce: f_number,
  blockHash: f_hash,
  from: f_address,
  contractAddress: f_address,
  to: f_address,

  value: f_bigNumber,
  tokenName: f_string,
  tokenSymbol: f_string,
  tokenDecimal: f_number,
  transactionIndex: f_number,

  gas: f_bigNumber,
  gasPrice: f_bigNumber,
  gasUsed: f_bigNumber,
}
export const convert = (tx: any) => Formatter.check(erc20formatter, tx) as ERC20Response
