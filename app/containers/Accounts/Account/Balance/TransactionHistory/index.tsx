import * as React from 'react';
import { Transaction } from '../../types'
import { DateRangeSelect, OnChangeCallback } from 'components/DateRangeSelect';
import { Table, Menu, Icon } from 'semantic-ui-react';
import { toHuman } from '@the-coin/utilities/lib/Conversion'

type MyProps = {
  transactions: Transaction[],
  onRangeChange: OnChangeCallback;
}

type MyState = {
  fromDate: Date,
  untilDate: Date
}

const today = new Date()
const twentyOneDaysAgo = new Date();
twentyOneDaysAgo.setDate(today.getDate() - 21)

class TransactionHistory extends React.PureComponent<MyProps, {}, MyState> {

  state = {
    fromDate: twentyOneDaysAgo,
    untilDate: today
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
  // On load, update balance
  render() {
    const { transactions } = this.props;
    const { fromDate, untilDate } = this.state;
    const transactionRows = transactions
      .filter((tx) => tx.date >= fromDate && tx.date <= untilDate)
      .map((tx) => (
          <Table.Row>
            <Table.Cell>{tx.date.toDateString()}</Table.Cell>
            <Table.Cell>{tx.logEntry}</Table.Cell>
            <Table.Cell>{toHuman(tx.change)}</Table.Cell>
            <Table.Cell>TODO</Table.Cell>
          </Table.Row>
        ));

    return (
      <React.Fragment>
        <DateRangeSelect onDateRangeChange={this.onDateRangeChange} />
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Change</Table.HeaderCell>
              <Table.HeaderCell>Balance</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {...transactionRows}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Menu floated='right' pagination>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  <Menu.Item as='a'>1</Menu.Item>
                  <Menu.Item as='a'>2</Menu.Item>
                  <Menu.Item as='a'>3</Menu.Item>
                  <Menu.Item as='a'>4</Menu.Item>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron right' />
                  </Menu.Item>
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </React.Fragment>
    );
  }
}

export { TransactionHistory }