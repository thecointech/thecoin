import * as React from 'react';
import { Table, Menu, Icon, Dimmer, Grid } from 'semantic-ui-react';
import { toHuman } from '@thecointech/utilities/Conversion'
import { FXRate } from '@thecointech/pricing';
import { weBuyAt } from '../FxRate/reducer';
import { fiatChange } from '../Account/profit';
import iconThecoin from "./images/icon_thecoin.svg";
//import iconBank from "./images/icon_bank.svg";
import iconCard from "./images/icon_card.svg";
import styles from './styles.module.less';
import { Transaction } from '@thecointech/tx-blockchain';
import { useState } from 'react';
import { useActiveAccount } from '../AccountMap';
import { useSelector } from 'react-redux';
import { selectLocale } from '../LanguageProvider/selector';
import { FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';
import { Filters } from './Filters';

type MyProps = {
  rates: FXRate[];
}

const hide = { id:"shared.transactionList.hide",
                defaultMessage:"Hide filters",
                description:"Label for the filter show / hide system"};
const show = { id:"app.transactionList.show",
                defaultMessage:"Show filters",
                description:"Label for the filter show / hide system"};

const sent = { id:"shared.transactionList.sent",
                defaultMessage:"Sent",
                description:"For title in comment section for the transaction history"};
const received = { id:"app.transactionList.received",
                defaultMessage:"Received",
                description:"For title in comment section for the transaction history"};

const to = { id:"shared.transactionList.to",
                defaultMessage:"To",
                description:"For description in comment section for the transaction history"};
const from = { id:"app.transactionList.from",
                defaultMessage:"From",
                description:"For description in comment section for the transaction history"};

function buildPagination(transactions: Transaction[], maxRowCount: number, currentPage: number) :[Transaction[], any]
{
  const pageCount = Math.ceil(transactions.length / maxRowCount);
  currentPage = Math.min(currentPage, pageCount - 1);
  if (pageCount > 1) {
    console.error('WARNING: Not Tested');
    const startRow = currentPage * maxRowCount;
    transactions = transactions.slice(startRow, startRow + maxRowCount);

    return [transactions, (
    <Table.Footer>
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

    let filteredTx = transactions.filter((tx) => tx.date.toMillis() >= fromDate.getTime() && tx.date.toMillis() <= untilDate.getTime())
    filteredTx.reverse();
    let [ txOutput, jsxFooter ] = buildPagination(filteredTx, maxRowCount, 0);

    let txJsxRows = txOutput.map((tx, index) => {
      const change = fiatChange(tx, rates);
      const balance = tx.balance *  weBuyAt(rates, tx.date.toJSDate());
      const changeCad = toHuman(change, true);
      const balanceCad = toHuman(balance, true);

      const imgForLine = changeCad < 0 ? iconCard : iconThecoin;
      const classForMoneyCell = changeCad < 0 ? styles.moneyNegative : styles.moneyPositive;
      const contentForComment = changeCad < 0 ? <FormattedMessage {...sent} /> : <FormattedMessage {...received} />;
      const descForComment = changeCad < 0 ? <FormattedMessage {...to} /> : <FormattedMessage {...from} />;

      const monthTodisplay = tx.date.setLocale(locale).monthShort;
      const yearToDisplay = tx.date.setLocale(locale).year;
      const dayToDisplay = tx.date.setLocale(locale).day;
      console.log(tx)
      return (
        <Grid.Row key={index} className={styles.transactionLine}>
          <Grid.Column className={styles.dateColumn} width={2} textAlign='center'>
            <div className={`${styles.dateInTable}`}>
              <div className={`font-small write-vertical ${styles.yearInTable}`}>{yearToDisplay}</div>
              <div className={"font-bold"}>{monthTodisplay}</div>
              <div className={`font-big ${styles.dayInTable}`}>{dayToDisplay}</div>
            </div>
          </Grid.Column>
          <Grid.Column className={styles.imageColumn} width={1}><img src={imgForLine} /></Grid.Column>
          <Grid.Column className={styles.contentColumn} width={7}>
            <div className={`font-bold ${styles.contentTextInTable}`}>{contentForComment}</div>
            <span className={`font-small font-green font-bold`}>{descForComment}</span>&nbsp;<span className={`${styles.toTextInTable} font-grey-06`}>{tx.counterPartyAddress}</span>
          </Grid.Column>
          <Grid.Column width={3} textAlign='right'>
            <div className={classForMoneyCell}>{changeCad} $</div>
            <div className={`${styles.timeInTable}`}>{tx.date.setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE)}</div>
          </Grid.Column>
          <Grid.Column textAlign='right' width={3}><div className={`font-big`}>{balanceCad} $&nbsp;&nbsp;</div></Grid.Column>
        </Grid.Row>
    )});

    const [filtersVisibility, setFiltersVisibility] = useState(true);
    const classForFilters = filtersVisibility ? styles.noDisplay : "";
    const labelForFilters = filtersVisibility ? show : hide;

    return (
      <React.Fragment>
        <a onClick={()=>setFiltersVisibility(!filtersVisibility)}><FormattedMessage {...labelForFilters} /></a>
        <div className={classForFilters}>
          <Filters onDateRangeChange={onDateRangeChange} />
        </div>

        <Dimmer.Dimmable>
          <Dimmer active={transactionLoading}>Loading...</Dimmer>
        </Dimmer.Dimmable>

        <Grid stackable padded>
          {...txJsxRows}
          {jsxFooter}
        </Grid>

      </React.Fragment>
    );
}
