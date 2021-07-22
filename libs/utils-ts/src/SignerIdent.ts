import { Signer, Wallet } from "ethers";

export const isSigner = (signer: Signer): signer is Signer => !isWallet(signer);
export const isWallet = (signer: Signer): signer is Wallet => (signer as Wallet)._mnemonic != null;
