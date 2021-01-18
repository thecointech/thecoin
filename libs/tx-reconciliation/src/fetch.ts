import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from "@the-coin/tx-firestore";
import { getAllFromFirestoreObsolete } from "@the-coin/tx-firestore/obsolete";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchCoinHistory } from '@the-coin/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { NormalizeAddress } from '@the-coin/utilities';
import { AllData } from './types';
import { log } from '@the-coin/logging';

export async function fetchAllRecords(rbcApi: RbcApi) : Promise<AllData>{

  log.debug('Fetching all raw data');

  let bank = await fetchBankTransactions(rbcApi);
  log.trace('Fetched raw banking data');
  let eTransfers = await fetchAndCleanETransfers();
  log.trace('Fetched raw e-Transfer mails');
  let dbs = await getAllFromFirestore();
  log.trace('Fetched database info');
  let blockchain = await fetchAndCleanCoinHistory();
  log.trace('Fetched raw blockchain info');

  let obsolete = await getAllFromFirestoreObsolete();
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
  let eTransfers = await fetchETransfers();
  return eTransfers.map(et => ({
    ...et,
    address: NormalizeAddress(et.address)
  }));
}
async function fetchAndCleanCoinHistory() {
  let coinHistory = await fetchCoinHistory();
  return coinHistory.map(et => ({
    ...et,
    counterPartyAddress: NormalizeAddress(et.counterPartyAddress)

  }))
}

