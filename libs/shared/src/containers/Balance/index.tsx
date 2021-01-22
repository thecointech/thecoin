import * as React from "react";
import { useSelector } from "react-redux";
import { Button, Grid, Popup, Icon, Header } from "semantic-ui-react";

import { toHuman } from "@the-coin/utilities";
import { getFxRate } from "../FxRate/reducer";
import { AccountPageProps } from "../Account/types";

import { TransactionHistory } from "../TransactionHistory";
import styles from "./styles.module.less";
import { calculateProfit } from "../Account/profit";
import { selectFxRate } from "../FxRate/selectors";

import { ClimateImpact } from "../Widgets/ClimateImpact";


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
        <Grid columns={2} rows={1} stackable>
          <Grid.Row>
            <Grid.Column width={12}>
              <p className={styles.have}>
                You have:{" "}
                <span className={styles.balance}>${cadBalance}</span>{" "}
                <Popup
                  trigger={<Icon name="chart line" className={styles.bankIcon} />}
                  content={profitDisplay}
                  position="top left"
                />
              </p>
              <Button onClick={doUpdateBalance}>Update Balance</Button>

              <TransactionHistory
                transactions={history}
                rates={rates}
                transactionLoading={historyLoading}
                onRangeChange={actions.updateHistory}
              />
            </Grid.Column>
            <Grid.Column width={4}>
                <Grid.Row>
                  <div><Header as="h5">Balance</Header><br /><br /></div>
                </Grid.Row>
                <Grid.Row>
                  <ClimateImpact />
                </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>

      </div>
    </React.Fragment>
  );
}
