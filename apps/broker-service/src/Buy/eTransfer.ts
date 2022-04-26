import { GetWallet } from "../exchange/Wallet";
import { getAddressShortCode } from "@thecointech/utilities/Address";
import { getSigner } from '../signedTimestamp';
import { SignedMessage } from '@thecointech/types';

export async function GenerateCode(request: SignedMessage)
{
	const address = getSigner(request);
	// generate this signers secret key
	const wallet = await GetWallet();
  return getAddressShortCode(address, wallet);
}
