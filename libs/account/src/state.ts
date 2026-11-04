import { AccountDetails } from './details';
import { DateTime } from 'luxon';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import type { TheCoin } from '@thecointech/contract-core';
import type { Transaction } from '@thecointech/tx-blockchain';
import type { Signer } from 'ethers';
import { PluginDetails } from '@thecointech/contract-plugins';


// An account state holds all relevant info
// for an account, including loaded transactions etc
export type AccountState = {
  // A normalized version of the accounts address
  address: string;
  // Possibly encrypted raw ethers wallet or metamask account
  signer: Signer;
  // Contract connected to this wallet as a signer
  contract: TheCoin | null;
  // All the plugins currently assigned to this account
  plugins: PluginDetails[];
  // Current balance in Coin
  balance: number;
  // Transaction history
  history: Transaction[];

  // User-stored account details
  details: AccountDetails;

  // cache values to remember the date range we
  // have stored, and corresponding block numbers
  historyLoading?: boolean;
  historyStart?: DateTime;
  historyStartBlock?: number;
  historyEnd?: DateTime;
  historyEndBlock?: number;

  // Mark account as read-only (e.g., demo accounts)
  readonly?: boolean;
};

export const DefaultAccountValues: Omit<AccountState, 'address' | 'signer'> = {
  contract: null,
  balance: -1,
  history: [],
  plugins: [],

  details: {
    preferences: {
      displayCurrency: 124, // CAD
    }
  }
};

export function buildNewAccount(name: string, address: string, signer: Signer): AccountState {
  return {
    ...DefaultAccountValues,
    details: {
      ...DefaultAccountValues.details,
      preferences: {
        ...DefaultAccountValues.details.preferences,
        accountName: name,
      },
    },
    address: NormalizeAddress(address),
    signer,
  }
}

// The user-visible name of the account (stored in preferences)
export const getAccountName = (account: Pick<AccountState, "address" | "details">) =>
  account.details.preferences.accountName ?? account.address;
