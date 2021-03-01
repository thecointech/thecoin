import { useActiveAccount } from "../../AccountMap";
import React from "react";
import { Header, Icon } from "semantic-ui-react";
import illustration from "./images/illust_balance.svg";
import styles from "./styles.module.less";
import { getFxRate, useFxRates } from "../../FxRate";
import { calculateProfit } from "../../Account/profit";
import { toHuman } from "../../../../../utils-ts/build/Conversion";

export const BalanceAndProfit = () => {
  const activeAccount = useActiveAccount();
  const { rates } = useFxRates();
  const { buy, fxRate } = getFxRate(rates, 0);
  const balance = activeAccount?.balance ? activeAccount?.balance : 0
  const history = activeAccount?.history ? activeAccount?.history : [];
  
  const cadBalance = toHuman(buy * balance * fxRate, true);
  const profit = calculateProfit(balance, history, rates);
  const profitDisplay = (profit < 1 ? "< .1" : profit.toString())
  return (
    <div className={ `${styles.balanceAndProfit} x2spaceAfter` }>
        <Header as="h5">
            Balance
        </Header>
        <img src={illustration} />
        <div>{cadBalance}</div>
        <div>CAD</div>
        <hr  />
        <Header as="h5">
            Profit
        </Header>
        <div><Icon name='arrow up' />{profitDisplay}%</div>
    </div>
  )
}
