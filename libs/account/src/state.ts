import { CurrencyCode } from '@thecointech/fx-rates'
import { AccountDetails } from './details';
import { DateTime } from 'luxon';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import type { TheCoin } from '@thecointech/contract-core';
import type { Transaction } from '@thecointech/tx-blockchain';
import type { Signer } from '@ethersproject/abstract-signer';
import type { SelfID } from '@thecointech/idx';


// An account state holds all relevant info
// for an account, including loaded transactions etc
export type AccountState = {
  // The accounts name as specified by the user
 name: string;
 // A normalized version of the accounts address
 address: string;
 // Possibly encrypted raw ethers wallet or metamask account
 signer: Signer;
 // Contract connected to this wallet as a signer
 contract: TheCoin | null;
 // Current balance in Coin
 balance: number;
 // Transaction history
 history: Transaction[];


 // IDX vars
 idx: SelfID|null;
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
 idx: null,

 details: {
   displayCurrency: CurrencyCode.CAD,
 }
};

export function buildNewAccount(name: string, address: string, signer: Signer) : AccountState {
  return {
    ...DefaultAccountValues,
    name,
    address: NormalizeAddress(address),
    signer,
  }
}
