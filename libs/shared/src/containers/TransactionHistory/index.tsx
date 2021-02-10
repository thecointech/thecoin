import * as React from 'react';
import { Table, Menu, Icon, Dimmer } from 'semantic-ui-react';
import { toHuman } from '@the-coin/utilities/Conversion'
import { FXRate } from '@the-coin/pricing';
import { DateRangeSelect, OnChangeCallback } from '../../components/DateRangeSelect';
import { weBuyAt } from '../FxRate/reducer';
import { fiatChange } from '../Account/profit';
//import { useSelector } from 'react-redux';
//import { selectLocale } from '@the-coin/site-base/containers/LanguageProvider/selector';
import iconThecoin from "./images/icon_thecoin.svg";
import iconBank from "./images/icon_bank.svg";
import styles from './styles.module.less';
import { Transaction } from '@the-coin/tx-blockchain';

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

    let filteredTx = transactions.filter((tx) => tx.date.toMillis() >= fromDate.getTime() && tx.date.toMillis() <= untilDate.getTime())
    let [ txOutput, jsxFooter ] = this.buildPagination(filteredTx, maxRowCount, 0);
    let txJsxRows = txOutput.map((tx, index) => {
      const change = fiatChange(tx, rates);
      const balance = tx.balance *  weBuyAt(rates, tx.date.toJSDate());
      const changeCad = toHuman(change, true);
      const balanceCad = toHuman(balance, true);

      let imgForLine = iconThecoin;
      let classForMoneyCell = styles.moneyPositive;
      let contentForComment = "IN";
      if (changeCad < 0){
        imgForLine = iconBank;
        classForMoneyCell = styles.moneyNegative;
        contentForComment = "OUT";
      }

      const monthTodisplay = tx.date.monthShort;
      const yearToDisplay = tx.date.year; 
      const dayToDisplay = tx.date.day;
      const timeToDisplay = tx.date.hour+":"+tx.date.minute; 
      //const dateToDisplay = `${yearToDisplay}<br />${monthTodisplay}<br />${dayToDisplay}`;
      //{tx.logEntry}
      return (
        <Table.Row key={index}>
          <Table.Cell width={2} textAlign='center'>
            <div className={`${styles.dateInTable}`}>
              <div className={`font-small write-vertical ${styles.yearInTable}`}>{yearToDisplay}</div>
              <div className={"font-bold"}>{monthTodisplay}</div>
              <div className={`font-big ${styles.dayInTable}`}>{dayToDisplay}</div>
            </div>
          </Table.Cell>
          <Table.Cell width={1}><img src={imgForLine} /></Table.Cell>
          <Table.Cell width={8}>
            <div>{contentForComment}</div>
            <span className={`font-small font-green font-bold`}>To</span> <span className={`font-grey-06`}>Test content</span>
          </Table.Cell>
          <Table.Cell width={3} textAlign='right'>
            <div className={classForMoneyCell}>{changeCad} $</div>
            <div className={`${styles.timeInTable}`}>{timeToDisplay}</div>
          </Table.Cell>
          <Table.Cell width={3}>${balanceCad}</Table.Cell>
        </Table.Row>
    )});

    return (
      <React.Fragment>
        <DateRangeSelect onDateRangeChange={this.onDateRangeChange} />

        <Dimmer.Dimmable>
          <Dimmer active={transactionLoading}>Loading...</Dimmer>
        </Dimmer.Dimmable>

        <Table basic='very' singleLine >
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
