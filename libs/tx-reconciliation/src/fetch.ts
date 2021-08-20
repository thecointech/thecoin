import gmail from '@thecointech/tx-gmail';
import { getAllActions, getAllUsers } from "@thecointech/broker-db";
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
  const users = await getAllUsers();
  const dbs = await getAllActions(users);
  log.trace('Fetched database info');
  const blockchain = await fetchAndCleanCoinHistory();
  log.trace('Fetched raw blockchain info');

  log.debug('Fetch complete');
  return {
    eTransfers,
    dbs,
    bank,
    blockchain,
  }
}

async function fetchAndCleanETransfers() {
  const eTransfers = await gmail.queryETransfers();
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

