
import { functions } from './index_common';
import { queryETransfers, queryNewDepositEmails } from './query';
import { initializeApi, setETransferLabel } from './fetch';
//
// Mocked electron fns.  We run the node code on the assumption
// that googleapi's has been mocked (so this should run in the browser happily)
const fns: functions = {

  bridge: async () => {},
  initialize: async () => {
    await initializeApi({} as any);
    return "devtoken";
  },
  queryETransfers,
  queryNewDepositEmails,
  setETransferLabel,
}
export default fns;
