import * as React from 'react';
import { Table, Menu, Icon, Dimmer } from 'semantic-ui-react';
import { toHuman } from '@the-coin/utilities/Conversion'
import { FXRate } from '@the-coin/pricing';
import { Transaction } from '../Account/types'
import { DateRangeSelect, OnChangeCallback } from '../../components/DateRangeSelect';
import { weBuyAt } from '../FxRate/reducer';
import { fiatChange } from '../Account/profit';
//import { useSelector } from 'react-redux';
//import { selectLocale } from '@the-coin/site-base/containers/LanguageProvider/selector';
import iconThecoin from "./images/icon_thecoin.svg";
import iconBank from "./images/icon_bank.svg";


type MyProps = {
  transactions: Transaction[];
  rates: FXRate[];
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
  locale: string;

  constructor(props: MyProps) {
    super(props);

    this.onDateRangeChange = this.onDateRangeChange.bind(this);
    this.locale = "en";
  }

  onDateRangeChange(from: Date, until: Date) {
    this.setState({
      fromDate: from,
      untilDate: until
    });

    this.props.onRangeChange(from, until)
    //this.locale = useSelector(selectLocale) as unknown as string;
  }

  buildPagination(transactions: Transaction[], maxRowCount: number, currentPage: number) :[Transaction[], any]
  {
    const pageCount = Math.ceil(transactions.length / maxRowCount);
    currentPage = Math.min(currentPage, pageCount - 1);
    if (pageCount > 1) {
      console.error('WARNING: Not Tested');
      const startRow = currentPage * maxRowCount;
      transactions = transactions.slice(startRow, startRow + maxRowCount);

      return [transactions, (<Table.Footer>
        <Table.Row>
          <Table.HeaderCell colSpan='4'>
            <Menu floated='right' pagination>
              <Menu.Item key={0} as='a' icon>
                <Icon name='chevron left' />
              </Menu.Item>
                {Array(pageCount).map((_, index) => <Menu.Item key={index + 1} as='a'>{index + 1}</Menu.Item>)}
              <Menu.Item key={pageCount + 1} as='a' icon>
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
    const { transactions, transactionLoading, rates } = this.props;
    const { fromDate, untilDate } = this.state;

    let filteredTx = transactions.filter((tx) => tx.date >= fromDate && tx.date <= untilDate)
    let [ txOutput, jsxFooter ] = this.buildPagination(filteredTx, maxRowCount, 0);
    let txJsxRows = txOutput.map((tx, index) => {
      const change = fiatChange(tx, rates);
      const balance = tx.balance *  weBuyAt(rates, tx.date);
      const changeCad = toHuman(change, true);
      const balanceCad = toHuman(balance, true);

      let imgForLine = iconThecoin;
      let classForMoneyCell = "moneyPositive";
      let contentForComment = "IN";
      if (changeCad < 0){
        imgForLine = iconBank;
        classForMoneyCell = "moneyNegative";
        contentForComment = "OUT";
      }

      const monthTodisplay = tx.date.toLocaleString(this.locale, { month: 'short' });
      const yearToDisplay = tx.date.getUTCFullYear();
      const dayToDisplay = tx.date.getUTCDate();
      //const dateToDisplay = `${yearToDisplay}<br />${monthTodisplay}<br />${dayToDisplay}`;
      //{tx.logEntry}
      return (
        <Table.Row key={index}>
          <Table.Cell width={2} textAlign='center'><span className={"font-small"}>{yearToDisplay}</span><br /><span className={"font-bold"}>{monthTodisplay}</span><br /><span className={"font-big"}>{dayToDisplay}</span></Table.Cell>
          <Table.Cell width={1}><img src={imgForLine} /></Table.Cell>
          <Table.Cell width={6}>{contentForComment}</Table.Cell>
          <Table.Cell width={4} textAlign='right' className={classForMoneyCell}>{changeCad} $</Table.Cell>
          <Table.Cell width={4}>${balanceCad}</Table.Cell>
        </Table.Row>
    )});

    return (
      <React.Fragment>
        <DateRangeSelect onDateRangeChange={this.onDateRangeChange} />

        <Dimmer.Dimmable>
          <Dimmer active={transactionLoading}>Loading...</Dimmer>
        </Dimmer.Dimmable>

        <Table basic='very' singleLine>
          <Table.Body>
            {...txJsxRows}
          </Table.Body>
          {jsxFooter}
        </Table>

      </React.Fragment>
    );
  }
}

export { TransactionHistory }
