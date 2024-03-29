import { ContractTransaction } from 'ethers';
import { BigNumber, BigNumberish } from 'ethers';
import type { TheGreenNFT } from '.';

export * from "./gassless";
export * from "./tokenCodes";

class MockNFT implements Pick<TheGreenNFT, "balanceOf"|"claimToken"> {
  tokens: string[] = [];

  balanceOf(owner: string): Promise<BigNumber> {
    return Promise.resolve(BigNumber.from(
      this.tokens.filter(t => t === owner).length
    ))
  }
  claimToken(tokenId: BigNumberish, claimant: string): Promise<ContractTransaction> {
    this.tokens[BigNumber.from(tokenId).toNumber()] = claimant;
    return Promise.resolve({
      wait: () => {},
      confirmations: 2,
      hash: "0x12345"
    } as unknown as ContractTransaction)
  }
}

export function getContract() {
  return Promise.resolve(new MockNFT());
}


export function connectNFT() {
  return Promise.resolve(new MockNFT());
}
