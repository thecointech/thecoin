import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from "@the-coin/tx-firestore";
import { getAllFromFirestoreObsolete } from "@the-coin/tx-firestore/obsolete";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchCoinHistory } from '@the-coin/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { AllData } from 'types';
import { NormalizeAddress } from '@the-coin/utilities';

import { RatesApi } from "@the-coin/pricing";

export async function fetchAllRecords(rbcApi: RbcApi) : Promise<AllData>{

  let eTransfers = await fetchAndCleanETransfers();
  let dbs = await getAllFromFirestore();
  let bank = await fetchBankTransactions(rbcApi);
  let blockchain = await fetchAndCleanCoinHistory();

  let obsolete = await getAllFromFirestoreObsolete();

  const fxRates = new RatesApi();
  const fetchRates = blockchain.map(tx => fxRates.getConversion(124, tx.date.toMillis()));
  const rates = await Promise.all(fetchRates);
  return {
    eTransfers,
    dbs,
    bank,
    blockchain,
    obsolete,
    rates: rates.map(r => r.data)
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

