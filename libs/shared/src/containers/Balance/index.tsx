import React, { useState } from "react";
import { Button, Popup, Icon } from "semantic-ui-react";
import { toHuman } from "@thecointech/utilities";
import { getFxRate } from "@thecointech/fx-rates";
import { TransactionList } from "../TransactionList";
import { calculateProfit } from "../Account/profit";
import { useFxRates } from "../FxRate/selectors";
import { AccountMap } from '../AccountMap';
import { Account } from '../Account';
import styles from "./styles.module.less";
import { DateTime } from "luxon";

export const Balance = () => {
  const account = AccountMap.useActive()!;
  const api = Account(account.address).useApi();
  const doUpdateBalance = React.useCallback((e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    api.updateBalance();
  }, [api]);
  React.useEffect(() => {
    doUpdateBalance();
  }, [])

  const fromDate = useState(DateTime.now().minus({year: 1}));
  const toDate = useState(DateTime.now());

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

        <TransactionList
          rates={rates}
          fromDate={fromDate}
          toDate={toDate}
        />
      </div>
    </React.Fragment>
  );
}
