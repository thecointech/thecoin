import * as React from 'react';
import { Transaction } from '../../types'

type SetDateRange = (startTime: Date, endTime: Date) => void;
type MyProps = {
  transactions: Transaction[],
  dateSetCallback: SetDateRange;
}

class TransactionHistory extends React.PureComponent<MyProps, {}, null> {

  	// On load, update balance

  render() {
    return <div>TODO: DateSelect, List</div>;
  }
}

export { TransactionHistory }