import * as React from "react";
import { Button, Popup, Icon } from "semantic-ui-react";

import { toHuman } from "@the-coin/utilities";
import { getFxRate } from "../FxRate/reducer";
import { AccountPageProps } from "../Account/types";

import { TransactionHistory } from "../TransactionHistory";
import styles from "./styles.module.less";
import { calculateProfit } from "../Account/profit";
import { useFxRates } from "../FxRate/selectors";


export const Balance = ({ account, actions }: AccountPageProps) => {

  const doUpdateBalance = React.useCallback((e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    actions.updateBalance();
  }, [actions]);
  React.useEffect(() => {
    doUpdateBalance();
  }, [])

  const { rates } = useFxRates();
  const { buy, fxRate } = getFxRate(rates, 0);
  const { balance, history } = account;
  const cadBalance = toHuman(buy * balance * fxRate, true);

  const profit = calculateProfit(balance, history, rates);

  const profitDisplay = "Current Profit: " + (profit < 1 ? "< .1%" : profit.toString())

  return (
    <React.Fragment>
      <div className={styles.wrapper}>
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
          rates={rates}
          onRangeChange={actions.updateHistory}
        />
      </div>
    </React.Fragment>
  );
}
