import React from "react";
import { Header, Icon } from "semantic-ui-react";
import illustration from "./images/illust_balance.svg";
import styles from "./styles.module.less";

export const BalanceAndProfit = () => {
  //const { locale } = useSelector(selectLocale);
  return (
    <div className={ `${styles.balanceAndProfit} x2spaceAfter` }>
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
