import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from "@the-coin/tx-firestore";
import { getAllFromFirestoreObsolete } from "@the-coin/tx-firestore/obsolete";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchCoinHistory } from '@the-coin/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { NormalizeAddress } from '@the-coin/utilities';
import { AllData } from './types';
import { log } from '@the-coin/logging';
import { fetchAllUsers } from "@the-coin/tx-firestore/users";
import { GetFirestore } from '../../utils-ts/build/firestore';

export async function fetchAllRecords(rbcApi: RbcApi) : Promise<AllData>{

  log.debug('Fetching all raw data');


  const userData = await fetchAllUserData();
  log.trace("Fetching all user data");

  const dbs = await getAllFromFirestore();
  log.trace('Fetched database info');
  const bank = await fetchBankTransactions(rbcApi);
  log.trace('Fetched raw banking data');
  const eTransfers = await fetchAndCleanETransfers();
  log.trace('Fetched raw e-Transfer mails');
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
    userData,
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

async function fetchAllUserData() {
  const users = await fetchAllUsers();
  const r: any = {};
  for (let i = 0; i < users.length; i++) {
    const address = users[i];
    const data = await GetFirestore().collection("User").doc(address).get();
    if (data.exists) {
      r[address] = data.data()
    }
  }
  return r;
}
