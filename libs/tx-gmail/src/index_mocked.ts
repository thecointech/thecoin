
import { functions } from './index_common.js';
import { queryETransfers, queryNewDepositEmails } from './query.js';
import { initializeApi, setETransferLabel } from './fetch.js';
import { getAuthClient } from './auth.js';
//
// Mocked electron fns.  We run the node code on the assumption
// that googleapi's has been mocked (so this should run in the browser happily)
const fns: functions = {

  bridge: async () => {},
  initialize: async () => {
    await initializeApi(getAuthClient())
    return "devtoken";
  },
  queryETransfers,
  queryNewDepositEmails,
  setETransferLabel,
}
export default fns;
