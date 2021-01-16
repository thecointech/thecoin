import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from "@the-coin/tx-firestore";
import { getAllFromFirestoreObsolete } from "@the-coin/tx-firestore/obsolete";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchCoinHistory } from '@the-coin/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { NormalizeAddress } from '@the-coin/utilities';

export async function fetchAllRecords(rbcApi: RbcApi) : Promise<AllData>{

  let bank = await fetchBankTransactions(rbcApi);
  let eTransfers = await fetchAndCleanETransfers();
  let dbs = await getAllFromFirestore();
  let blockchain = await fetchAndCleanCoinHistory();

  let obsolete = await getAllFromFirestoreObsolete();

  return {
    eTransfers,
    dbs,
    bank,
    blockchain,
    obsolete,

    cancellations: new Map()
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

