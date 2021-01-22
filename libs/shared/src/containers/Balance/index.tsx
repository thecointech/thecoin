import * as React from "react";
import { useSelector } from "react-redux";
import { Button, Popup, Icon } from "semantic-ui-react";

import { toHuman } from "@the-coin/utilities";
import { getFxRate } from "../FxRate/reducer";
import { AccountPageProps } from "../Account/types";

import { TransactionHistory } from "../TransactionHistory";
import styles from "./styles.module.less";
import { calculateProfit } from "../Account/profit";
import { selectFxRate } from "../FxRate/selectors";


export const Balance = ({ account, actions }: AccountPageProps) => {

  const doUpdateBalance = React.useCallback((e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    actions.updateBalance();
  }, [actions]);
  React.useEffect(() => {
    doUpdateBalance();
  }, [])

  const { rates } = useSelector(selectFxRate);
  const { buy, fxRate } = getFxRate(rates, 0);
  const { balance, history, historyLoading } = account;
  const cadBalance = toHuman(buy * balance * fxRate, true);

  const rawProfit = calculateProfit(balance, history, rates);
  const profit = toHuman(rawProfit, true);

  const profitDisplay = "Current Profit: " + (profit < 1 ? "< .1%" : profit.toString())

  return (
    <React.Fragment>
      <div className={styles.wrapper}>
<<<<<<< Updated upstream
        <Grid columns={2} stackable>
          <Grid.Row>
            <Grid.Column>
              <p className={styles.have}>
                You have:{" "}
                <span className={styles.balance}>${cadBalance}</span>{" "}
                <Popup
                  trigger={<Icon name="chart line" className={styles.bankIcon} />}
                  content={profitDisplay}
                  position="top left"
                />
              </p>
            </Grid.Column>
            <Grid.Column width={2}></Grid.Column>
          </Grid.Row>
        </Grid>

=======
        <p className={styles.have}>
          You have:{" "}
          <span className={styles.balance}>${cadBalance}</span>{" "}
          <Popup
            trigger={<Icon name="chart line" className={styles.bankIcon} />}
            content={profitDisplay}
            position="top left"
          />
        </p>
>>>>>>> Stashed changes
        <Button onClick={doUpdateBalance}>Update Balance</Button>

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
