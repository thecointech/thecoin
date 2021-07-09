import { CurrencyCode } from '@thecointech/utilities/CurrencyCodes'
import { AnySigner } from '@thecointech/utilities/SignerIdent'
import { Transaction } from '@thecointech/tx-blockchain';
import { AccountDetails } from './details';
import { IDX } from '@ceramicstudio/idx';
import { DateTime } from 'luxon';
import { TheCoin } from '@thecointech/contract';
import { NormalizeAddress } from '@thecointech/utilities/Address';


// An account state holds all relevant info
// for an account, including loaded transactions etc
export type AccountState = {
  // The accounts name as specified by the user
 name: string;
 // A normalized version of the accounts address
 address: string;
 // Possibly encrypted raw ethers wallet or metamask account
 signer: AnySigner;
 // Contract connected to this wallet as a signer
 contract: TheCoin | null;
 // Current balance in Coin
 balance: number;
 // Transaction history
 history: Transaction[];


 // IDX vars
 idx?: IDX;
 // Are we saving/loading something from IDX?
 idxIO?: boolean;

 // Private details
 details: AccountDetails;
 // Public profile (?)

 // cache values to remember the date range we
 // have stored, and corresponding block numbers
 historyLoading?: boolean;
 historyStart?: DateTime;
 historyStartBlock?: number;
 historyEnd?: DateTime;
 historyEndBlock?: number;
};

export const DefaultAccountValues = {
 contract: null,
 balance: -1,
 history: [],

 details: {
   displayCurrency: CurrencyCode.CAD,
 }
};

export function buildNewAccount(name: string, signer: AnySigner) : AccountState {
  const address = NormalizeAddress(signer.address);
  return {
    ...DefaultAccountValues,
    name,
    address,
    signer,
  }
}