import { Signer, Wallet } from "ethers/ethers";

export interface SignerIdent {
  address: string;
  _isSigner: true;
}

export type TheSigner = Signer & SignerIdent;

export type AnySigner = TheSigner|Wallet;

export const isSigner = (signer: AnySigner): signer is TheSigner =>  (signer as TheSigner)._isSigner;
export const isWallet = (signer: AnySigner): signer is Wallet => !isSigner(signer);