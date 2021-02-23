import * as React from "react";
import { Header } from "semantic-ui-react";
import { useFxRates } from "../FxRate/selectors";
import { FormattedMessage } from "react-intl";
import styles from './styles.module.less';
import { TransactionList } from "containers/TransactionList";

const title = { id:"shared.balance.title",
                defaultMessage:"Recent Operations",
                description:"Title for the congratulations page"};

export const RecentTransactions = () => {
  const { rates } = useFxRates();

  return (
    <React.Fragment>
      <div className={ `${styles.recentTransactionsContainer}`}>
        <Header as="h5"><FormattedMessage {...title} /></Header>

        <TransactionList
          rates={rates}
        />
      </div>
    </React.Fragment>
  );
}
