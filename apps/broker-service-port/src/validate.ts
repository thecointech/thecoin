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
    // equivalent values?
    const toFiat = result.history.find(s => s.delta.fiat?.gt(0));
    const toCoin =  result.history.find(s => s.delta.coin?.gt(0));
    assert(toFiat?.delta.fiat?.eq(tx.data.fiatDisbursed));
    assert(toCoin?.delta.coin?.eq(tx.data.transfer.value));

    // When processed?  Don't check for txs where the time was manually tweaked
    if (
      tx.data.hash != '0x7d2a89aa68ebb0a33c7608202af54450d672ad923a002386f55d6963a82f7366' &&
      tx.data.hash != '0x78d5f91534accebb66d36ce4d681bf5bbbae5a20ac1d1c2cfebbfaba33c8ef60' &&
      (tx.data.processedTimestamp && tx.data.completedTimestamp && tx.data.completedTimestamp.toMillis() > tx.data.processedTimestamp.toMillis())
    ) {
      const converted = result.history.find(s => s.name == "converted");
      const newc = converted?.delta.date?.toMillis();
      const oldc = tx.data.processedTimestamp?.toMillis() ?? tx.blockchain?.date.toMillis();
      // Same day?
      assert(!!newc && !!oldc && (Math.abs(newc - oldc) < (24 * 60 * 60 * 1000)));
    }
  }
}
