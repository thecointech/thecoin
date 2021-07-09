import * as React from "react";
import { Header } from "semantic-ui-react";
import { AccountPageProps } from "../Account/types";
import { TransactionList } from "../TransactionList";
import { useFxRates } from "../FxRate/selectors";
import { defineMessages, FormattedMessage } from "react-intl";
import styles from './styles.module.less';

const translate = defineMessages({ 
      title : {
        id: "shared.balance.title", 
        defaultMessage:"Recent Operations",
        description:"shared.balance.title: Title for the congratulations page"}});

export const RecentTransactions = ({ actions }: AccountPageProps) => {

  React.useEffect(() => {
    actions.updateBalance();
  }, [actions])

  const { rates } = useFxRates();

  return (
    <React.Fragment>
      <div className={ `${styles.recentTransactionsContainer}`}>
        <Header as="h5"><FormattedMessage {...translate.title} /></Header>

        <TransactionList
          rates={rates}
        />
      </div>
    </React.Fragment>
  );
}