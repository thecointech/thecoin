import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from "@the-coin/tx-firestore";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchCoinHistory } from '@the-coin/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { AllData } from 'types';
import { NormalizeAddress } from '@the-coin/utilities';

export async function fetchAllRecords(rbcApi: RbcApi) : Promise<AllData>{

  let eTransfers = await fetchAndCleanETransfers();
  let dbs = await getAllFromFirestore();
  let bank = await fetchBankTransactions(rbcApi);
  let blockchain = await fetchAndCleanCoinHistory();

  return {
    eTransfers,
    dbs,
    bank,
    blockchain,
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

