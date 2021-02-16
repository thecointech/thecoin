import * as React from "react";
import { Header } from "semantic-ui-react";
import { AccountPageProps } from "../Account/types";
import { TransactionHistory } from "../TransactionHistory";
import { useFxRates } from "../FxRate/selectors";
import { FormattedMessage } from "react-intl";
import styles from './styles.module.less';

const title = { id:"shared.balance.title",
                defaultMessage:"Recent Operations",
                description:"Title for the congratulations page"};

export const RecentTransactions = ({ account, actions }: AccountPageProps) => {

  React.useEffect(() => {
    actions.updateBalance();
  }, [actions])

  const { rates } = useFxRates();
  const { history, historyLoading } = account;

  return (
    <React.Fragment>
      <div className={ `${styles.recentTransactionsContainer}`}>
        <Header as="h5"><FormattedMessage {...title} /></Header>

        <TransactionHistory
          transactions={history}
          rates={rates}
          transactionLoading={historyLoading}
          onRangeChange={actions.updateHistory}
        />
      </div>
    </React.Fragment>
  );
}
