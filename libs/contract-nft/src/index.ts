import type { TheGreenNFTL1  } from './types/contracts/ethereum/TheGreenNFTL1';
import type { TheGreenNFTL2  } from './types/contracts/polygon/TheGreenNFTL2';
export type TheGreenNFT = TheGreenNFTL1|TheGreenNFTL2;
export * from './connect';
export * from './contract';
export * from './ipfs';
export * from './gassless';
export * from './metadata';
export * from './tokenCodes';
