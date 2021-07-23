import { ContractTransaction } from 'ethers';
import { utils } from 'ethers';
import type { TheCoinNFT } from '.';

class MockNFT implements Pick<TheCoinNFT, "balanceOf"|"claimToken"> {
  tokens: string[] = [];

  balanceOf(owner: string): Promise<utils.BigNumber> {
    return Promise.resolve(new utils.BigNumber(
      this.tokens.filter(t => t === owner).length
    ))
  }
  claimToken(tokenId: utils.BigNumberish, claimant: string): Promise<ContractTransaction> {
    this.tokens[utils.bigNumberify(tokenId).toNumber()] = claimant;
    return Promise.resolve({
      wait: () => {},
      confirmations: 2,
      hash: "0x12345"
    } as unknown as ContractTransaction)
  }
}

export function getContract(): TheCoinNFT {
  return new MockNFT() as unknown as TheCoinNFT;
}


export function connectNFT(): TheCoinNFT {
  return new MockNFT() as unknown as TheCoinNFT;
}
