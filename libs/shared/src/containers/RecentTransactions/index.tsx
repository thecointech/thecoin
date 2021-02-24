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

export const RecentTransactions = ({ actions }: AccountPageProps) => {

  React.useEffect(() => {
    actions.updateBalance();
  }, [actions])

  const { rates } = useFxRates();

  return (
    <React.Fragment>
      <div className={ `${styles.recentTransactionsContainer}`}>
        <Header as="h5"><FormattedMessage {...title} /></Header>

        <TransactionHistory
          rates={rates}
          onRangeChange={actions.updateHistory}
        />
      </div>
    </React.Fragment>
  );
}