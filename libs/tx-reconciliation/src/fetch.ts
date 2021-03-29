import { fetchETransfers } from '@thecointech/tx-gmail';
import { getAllFromFirestore } from "@thecointech/tx-firestore";
import { getAllFromFirestoreObsolete } from "@thecointech/tx-firestore/obsolete";
import { RbcApi } from '@thecointech/rbcapi';
import { fetchCoinHistory } from '@thecointech/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { NormalizeAddress } from '@thecointech/utilities';
import { AllData } from './types';
import { log } from '@thecointech/logging';

export async function fetchAllRecords(rbcApi: RbcApi) : Promise<AllData>{

  log.debug('Fetching all raw data');

  const bank = await fetchBankTransactions(rbcApi);
  log.trace('Fetched raw banking data');
  const eTransfers = await fetchAndCleanETransfers();
  log.trace('Fetched raw e-Transfer mails');
  const dbs = await getAllFromFirestore();
  log.trace('Fetched database info');
  const blockchain = await fetchAndCleanCoinHistory();
  log.trace('Fetched raw blockchain info');

  const obsolete = await getAllFromFirestoreObsolete();
  log.trace('Fetched obsolete firestore info');

  log.debug('Fetch complete');
  return {
    eTransfers,
    dbs,
    bank,
    blockchain,
    obsolete,
  }
}

async function fetchAndCleanETransfers() {
  const eTransfers = await fetchETransfers();
  return eTransfers.map(et => ({
    ...et,
    address: NormalizeAddress(et.address)
  }));
}
async function fetchAndCleanCoinHistory() {
  const coinHistory = await fetchCoinHistory();
  return coinHistory.map(et => ({
    ...et,
    counterPartyAddress: NormalizeAddress(et.counterPartyAddress)

  }))
}

