import type { TheGreenNFTL1  } from './codegen/contracts/ethereum/TheGreenNFTL1';
import type { TheGreenNFTL2  } from './codegen/contracts/polygon/TheGreenNFTL2';
export type TheGreenNFT = TheGreenNFTL1|TheGreenNFTL2;
export * from './contract';
export * from './ipfs';
export * from './gassless';
export * from './metadata';
export * from './tokenCodes';
