import { Signer } from "ethers/ethers";

export interface SignerIdent {
	address: string;
}

export type TheSigner = Signer & SignerIdent;
