import * as React from 'react';
import { Menu, Icon, Dimmer, Grid, Segment, Header } from 'semantic-ui-react';
import { toHuman } from '@thecointech/utilities/Conversion'
import { FXRate, weBuyAt } from '@thecointech/fx-rates';
import { fiatChange } from '../Account/profit';
import iconThecoin from "./images/icon_thecoin.svg";
import iconCard from "./images/icon_card.svg";
import styles from './styles.module.less';
import { Transaction } from '@thecointech/tx-blockchain';
import { useState } from 'react';
import { AccountMap } from '../AccountMap';
import { useSelector } from 'react-redux';
import { selectLocale } from '../LanguageProvider/selector';
import { defineMessages, FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';
import { Filters } from './Filters';
import { TransactionLine } from './TransactionLine';
import { NormalizeAddress } from '@thecointech/utilities';

type MyProps = {
  rates: FXRate[];
}

const translate = defineMessages({
        sent : {
          defaultMessage:"Sent",
          description:"shared.transactionList.sent: For title in comment section for the transaction history"},
        received : {
          defaultMessage:"Received",
          description:"shared.transactionList.received: For title in comment section for the transaction history"},
        to : {
          defaultMessage:"To",
          description:"shared.transactionList.to: For description in comment section for the transaction history"},
        from : {
          defaultMessage:"From",
          description:"shared.transactionList.from: For description in comment section for the transaction history"},
        notransactions : {
          defaultMessage:"We don't have any transactions matching your query.",
          description:"app.transactionList.notransactions: For when we have no transactions to display for the transaction history"},
        loading : {
          defaultMessage:"Loading...",
          description:"shared.transactionList.loading: For loading in comment section for the transaction history"}});

function buildPagination(transactions: Transaction[], maxRowCount: number, currentPage: number) :[Transaction[], any]
{
  const pageCount = Math.ceil(transactions.length / maxRowCount);
  currentPage = Math.min(currentPage, pageCount - 1);
  if (pageCount > 1) {
    // console.error('WARNING: Not Tested');
    const startRow = currentPage * maxRowCount;
    transactions = transactions.slice(startRow, startRow + maxRowCount);

    return [transactions, (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <Menu floated='right' pagination>
            <Menu.Item key={0} as='a' icon>
              <Icon name='chevron left' />
            </Menu.Item>
              {Array(pageCount).map((_, index) => <Menu.Item key={index + 1} as='a'>{index + 1}</Menu.Item>)}
            <Menu.Item key={pageCount + 1} as='a' icon>
              <Icon name='chevron right' />
            </Menu.Item>
          </Menu>
        </Grid.Column>
      </Grid.Row>
    </Grid>)]
  }
  return [transactions, undefined]
}


export const TransactionList = (props: MyProps) => {

  const [fromDate, setFromDate] = useState(DateTime.now());
  const [untilDate, setUntilDate] = useState(DateTime.now());


  function onDateRangeChange(from: Date, until: Date) {
    // Show all txs for a given day
    const roundedFrom = DateTime.fromJSDate(from).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const roundedTo = DateTime.fromJSDate(until).set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    setFromDate(roundedFrom);
    setUntilDate(roundedTo);
  }
  const { locale } = useSelector(selectLocale);

  const maxRowCount = 50;
  const { rates } = props;
  const account = AccountMap.useActive();
  const transactions = account!.history;
  const transactionLoading = account?.historyLoading;

  let filteredTx = transactions.filter((tx) => tx.date.toMillis() >= fromDate.toMillis() && tx.date.toMillis() <= untilDate.toMillis())
  filteredTx.reverse();
  // Don't display the fee's
  const xferAssistAddress = process.env.WALLET_BrokerTransferAssistant_ADDRESS;
  if (xferAssistAddress) {
    const filterAddress = NormalizeAddress(xferAssistAddress);
    filteredTx = filteredTx.filter((tx) => NormalizeAddress(tx.to) != filterAddress);
  }

  let [ txOutput, jsxFooter ] = buildPagination(filteredTx, maxRowCount, 0);

  let txJsxRows = txOutput.map((tx, index) => {
    const change = fiatChange(tx, rates);
    const balance = tx.balance *  weBuyAt(rates, tx.date.toJSDate());
    const changeCad = toHuman(change, true);
    const balanceCad = toHuman(balance, true);

    const imgForLine = changeCad < 0 ? iconCard : iconThecoin;
    const classForMoneyCell = changeCad < 0 ? styles.moneyNegative : styles.moneyPositive;
    const contentForComment = changeCad < 0 ? <FormattedMessage {...translate.sent} /> : <FormattedMessage {...translate.received} />;
    const descForComment = changeCad < 0 ? <FormattedMessage {...translate.to} /> : <FormattedMessage {...translate.from} />;

    const monthTodisplay = tx.date.setLocale(locale).monthShort!;
    const yearToDisplay = tx.date.setLocale(locale).year;
    const dayToDisplay = tx.date.setLocale(locale).day;

    const timeToDisplay = tx.date.setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE);
    const addressComment = NormalizeAddress(tx.to) == account?.address ? tx.from : tx.to;
    return (
      <TransactionLine
        id={index}
        locale={locale}

        yearToDisplay={yearToDisplay}
        monthTodisplay={monthTodisplay}
        dayToDisplay={dayToDisplay}

        imgForLine={imgForLine}
        contentForComment={contentForComment}
        addressComment={addressComment}
        descForComment={descForComment}

        classForMoneyCell={classForMoneyCell}
        changeCad={changeCad}
        timeToDisplay={timeToDisplay}

        balanceCad={balanceCad}
      />
  )});
  const transactionsListZone = txJsxRows.length > 0
      ? <Grid padded>{...txJsxRows}{jsxFooter}</Grid>
      : <Segment placeholder><Header as="h4" icon><Icon name='search' /><FormattedMessage {...translate.notransactions} /></Header></Segment> ;

  return (
    <React.Fragment>
      <Filters onDateRangeChange={onDateRangeChange} />

      <Dimmer.Dimmable>
        <Dimmer active={transactionLoading}><FormattedMessage {...translate.loading} /></Dimmer>
      </Dimmer.Dimmable>

      {transactionsListZone}

    </React.Fragment>
  );
}
