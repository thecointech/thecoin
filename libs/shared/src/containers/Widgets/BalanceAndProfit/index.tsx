import React from "react";
import { Header, Icon } from "semantic-ui-react";
import illustration from "./images/illust_balance.svg";
import styles from "./styles.module.less";

export type Props = {
  Mobile: boolean;
}

export const BalanceAndProfit = (props:Props) => {
  let classForContainer = "";
  if (props.Mobile === true){
    classForContainer = styles.mobile;
  }
  return (
    <div className={ `${styles.balanceAndProfit} ${classForContainer} x2spaceAfter` }>
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
