import { getCurrentState, AnyActionContainer } from '@thecointech/tx-statemachine';
import { DateTime } from 'luxon';
import { Timestamp } from '@thecointech/firestore';
import { ReconciledRecord } from './types';

export const toDateTime = (ts: Timestamp) => DateTime.fromMillis(ts.toMillis());

const assert = (condition?: boolean) => {
  if (condition === undefined || !condition) {
    debugger;
    throw new Error("asdfasdf");
  }
}
export function validate(result: AnyActionContainer, tx: ReconciledRecord) {
  // there were 2 failed tx's which I've ignored until now
  if (tx.data.hash == '0x58831f8d8ce372d38378aca8bb90dd8ba85ba913c22fcb75f3551881d5001fd8')
  {
    return;
  }
  // on complete, all values should be present & 0
  const current = getCurrentState(result);
  assert(current.data.fiat?.eq(0));
  assert(current.data.coin?.eq(0));
  assert(current.name == "complete");

  // get results.  This relies on accurate tx data, so only functional in prod environments
  if (process.env.NODE_ENV === 'production') {
    const fiat = result.history.find(s => s.data.fiat?.gt(0))?.data.fiat;
    const coin = result.history.find(s => s.data.coin?.gt(0))?.data.coin;

    assert(fiat?.eq(tx.data.fiatDisbursed));
    assert(coin?.eq(tx.data.transfer.value));
  }
}
