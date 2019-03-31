import * as React from 'react';
import { Transaction } from 'containers/Account/types'
import { DateRangeSelect, OnChangeCallback } from 'components/DateRangeSelect';
import { Table, Menu, Icon, Dimmer } from 'semantic-ui-react';
import { toHuman } from '@the-coin/utilities/lib/Conversion'
import { Range } from 'immutable';

type MyProps = {
  transactions: Transaction[],
  onRangeChange: OnChangeCallback;
  transactionLoading?: boolean;
}

type MyState = {
  fromDate: Date,
  untilDate: Date
}

class TransactionHistory extends React.PureComponent<MyProps, {}, MyState> {

  state = {
    fromDate: new Date(),
    untilDate: new Date()
  }

  constructor(props: MyProps) {
    super(props);

    this.onDateRangeChange = this.onDateRangeChange.bind(this);
  }

  onDateRangeChange(from: Date, until: Date) {
    this.setState({
      fromDate: from,
      untilDate: until
    });

    this.props.onRangeChange(from, until)
  }

  buildPagination(transactions: Transaction[], maxRowCount: number, currentPage: number) :[Transaction[], any]
  {
    const pageCount = Math.ceil(transactions.length / maxRowCount);
    currentPage = Math.min(currentPage, pageCount - 1);
    if (pageCount > 1) {
      console.log('WARNING: Not Tested');
      const startRow = currentPage * maxRowCount;
      transactions = transactions.slice(startRow, startRow + maxRowCount);
      
      return [transactions, (<Table.Footer>
        <Table.Row>
          <Table.HeaderCell colSpan='4'>
            <Menu floated='right' pagination>
              <Menu.Item as='a' icon>
                <Icon name='chevron left' />
              </Menu.Item>
                {Range(1, pageCount).map((value) => <Menu.Item as='a'>{value}</Menu.Item>)}
              <Menu.Item as='a' icon>
                <Icon name='chevron right' />
              </Menu.Item>
            </Menu>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>)]  
    }

    return [transactions, undefined]
  }
  // On load, update balance
  render() {
    const maxRowCount = 50;
    const { transactions, transactionLoading } = this.props;
    const { fromDate, untilDate } = this.state;

    let filteredTx = transactions.filter((tx) => tx.date >= fromDate && tx.date <= untilDate)
    let [ txOutput, jsxFooter ] = this.buildPagination(filteredTx, maxRowCount, 0);
    let txJsxRows = txOutput.map((tx) => (
        <Table.Row key={tx.date.valueOf()}>
          <Table.Cell>{tx.date.toDateString()}</Table.Cell>
          <Table.Cell>{tx.logEntry}</Table.Cell>
          <Table.Cell>{toHuman(tx.change)}</Table.Cell>
          <Table.Cell>TODO</Table.Cell>
        </Table.Row>
      ));

    return (
      <React.Fragment>
        <DateRangeSelect onDateRangeChange={this.onDateRangeChange} />

        <Dimmer.Dimmable as={Table} celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Change</Table.HeaderCell>
              <Table.HeaderCell>Balance</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Dimmer active={transactionLoading}>Loading...</Dimmer>
              </Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
              <Table.Cell></Table.Cell>
            </Table.Row>
            {...txJsxRows}
          </Table.Body>
          {jsxFooter}
        </Dimmer.Dimmable>
      </React.Fragment>
    );
  }
}

export { TransactionHistory }