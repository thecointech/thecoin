import * as React from 'react';
import { Table, Menu, Icon, Dimmer } from 'semantic-ui-react';
import { toHuman } from '@thecointech/utilities/Conversion'
import { FXRate } from '@thecointech/pricing';
import { DateRangeSelect } from '../../components/DateRangeSelect';
import { weBuyAt } from '../FxRate/reducer';
import { fiatChange } from '../Account/profit';
import iconThecoin from "./images/icon_thecoin.svg";
import iconBank from "./images/icon_bank.svg";
import styles from './styles.module.less';
import { Transaction } from '@thecointech/tx-blockchain';
import { useState } from 'react';
import { useActiveAccount } from '../AccountMap';
import { useSelector } from 'react-redux';
import { selectLocale } from '../LanguageProvider/selector';

type MyProps = {
  rates: FXRate[];
}


function buildPagination(transactions: Transaction[], maxRowCount: number, currentPage: number) :[Transaction[], any]
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


export const TransactionList = (props: MyProps) => {

  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());

    function onDateRangeChange(from: Date, until: Date) {
      setFromDate(from);
      setUntilDate(until);
    }
    const { locale } = useSelector(selectLocale);

    const maxRowCount = 50;
    const { rates } = props;
    const account = useActiveAccount();
    const transactions = account!.history;
    const transactionLoading = account?.historyLoading;

    let filteredTx = transactions.filter((tx: { date: { toMillis: () => number; }; }) => tx.date.toMillis() >= fromDate.getTime() && tx.date.toMillis() <= untilDate.getTime())
    filteredTx.reverse();
    let [ txOutput, jsxFooter ] = buildPagination(filteredTx, maxRowCount, 0);

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
      const monthTodisplay = tx.date.setLocale(locale).monthShort;
      const yearToDisplay = tx.date.setLocale(locale).year;
      const dayToDisplay = tx.date.setLocale(locale).day;
      const timeToDisplay = tx.date.setLocale(locale).hour+":"+tx.date.setLocale(locale).minute;
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
          <Table.Cell textAlign='right' width={3}><div className={`font-big`}>{balanceCad} $</div></Table.Cell>
        </Table.Row>
    )});

    return (
      <React.Fragment>
        <DateRangeSelect onDateRangeChange={onDateRangeChange} />

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
