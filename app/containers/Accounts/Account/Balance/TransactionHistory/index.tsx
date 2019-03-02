import * as React from 'react';
import { Transaction } from '../../types'
import { DateRangeSelect } from 'components/DateRangeSelect';

type SetDateRange = (startTime: Date, endTime: Date) => void;
type MyProps = {
  transactions: Transaction[],
  dateSetCallback: SetDateRange;
}

class TransactionHistory extends React.PureComponent<MyProps, {}, null> {

  	// On load, update balance

  render() {
    return (
    <React.Fragment>
      <DateRangeSelect />
    </React.Fragment>
    );
  }
}

export { TransactionHistory }