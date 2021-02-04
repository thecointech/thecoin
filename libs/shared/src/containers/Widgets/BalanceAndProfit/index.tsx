import React from "react";
import { Header, Icon } from "semantic-ui-react";
import illustration from "./images/illust_balance.svg";
import styles from "./styles.module.less";
//import { useSelector } from "react-redux";

//import { toHuman } from "@the-coin/utilities";
//import { getFxRate } from "../../FxRate/reducer";
//import { AccountPageProps } from "../../Account/types";

//import { calculateProfit } from "../../Account/profit";
//import { selectFxRate } from "../../FxRate/selectors";

export type Props = {
  Mobile: boolean;
}

export const BalanceAndProfit = (props:Props) => {
  let classForContainer = "";
  if (props.Mobile === true){
    classForContainer = styles.mobile;
  }


/*


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
        <p className={styles.have}>
          You have:{" "}
          <span className={styles.balance}>${cadBalance}</span>{" "}

*/


  return (
    <div className={ `${styles.balanceAndProfit} ${classForContainer} x2spaceAfter appContainer` }>
        <Header as="h5">
            Balance
        </Header>
        <img src={illustration} />
        <div>10 000</div>
        <div>CAD</div>
        <hr  />
        <Header as="h5">
            Profit
        </Header>
        <div><Icon name='arrow up' />9%</div>
    </div>
  )
}
