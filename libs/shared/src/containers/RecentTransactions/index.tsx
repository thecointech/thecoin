import * as React from "react";
import { Header } from "semantic-ui-react";
import { TransactionList } from "../TransactionList";
import { useFxRates } from "../FxRate/selectors";
import { defineMessages, FormattedMessage } from "react-intl";
import styles from './styles.module.less';
import { AccountMap } from '@thecointech/redux-accounts';
import { Account } from '../Account';
import { DateTime } from 'luxon';

const translate = defineMessages({
      title : {
        defaultMessage:"Recent Operations",
        description:"shared.balance.title: Title for the congratulations page"}});

type DateTimeState = [DateTime, (v: DateTime) => void];
type Props = {
  fromDate: DateTimeState,
  toDate: DateTimeState,
}

export const RecentTransactions = ({ fromDate, toDate}: Props) => {

  const active = AccountMap.useActive()
  const api = Account(active!.address).useApi();
  React.useEffect(() => {
    api.updateHistory(DateTime.fromMillis(0), DateTime.now());
  }, [active?.address])

  const { rates } = useFxRates();

  return (
    <React.Fragment>
      <div className={ `${styles.recentTransactionsContainer}`}>
        <Header as="h5"><FormattedMessage {...translate.title} /></Header>

        <TransactionList
          fromDate={fromDate}
          toDate={toDate}
          rates={rates}
        />
      </div>
    </React.Fragment>
  );
}
