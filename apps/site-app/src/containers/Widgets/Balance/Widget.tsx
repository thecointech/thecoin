import React from "react";
import { Header, Icon } from "semantic-ui-react";
import illustration from "./images/illust_balance.svg";
import illustrationMobile from "./images/mob_illust_balance.svg";
import { useFxRates } from "@thecointech/shared/containers/FxRate";
import { calculateProfit } from "@thecointech/shared/containers/Account/profit";
import { AccountMap } from "@thecointech/shared/containers/AccountMap";
import { toHuman } from "@thecointech/utilities/Conversion";
import { defineMessages, FormattedMessage } from "react-intl";
import { getFxRate } from '@thecointech/fx-rates';
import styles from "./styles.module.less";

const translate = defineMessages({
    balanceTitle : {
      id: "shared.widgets.balanceandprofit.balance",
      defaultMessage:"Balance",
      description:"shared.widgets.balanceandprofit.balance: Title for widget Balance and profit" },
    profitTitle : {
      id: "shared.widgets.balanceandprofit.profit",
      defaultMessage:"Profit",
      description:"shared.widgets.balanceandprofit.profit: Title for widget Balance and profit" },
    cad : {
      id: "shared.widgets.balanceandprofit.cad",
      defaultMessage:"$CAD",
      description:"shared.widgets.balanceandprofit.cad: Title for widget Balance and profit" }});


export const BalanceAndProfit = () => {
  const activeAccount = AccountMap.useActive();
  const { rates } = useFxRates();
  const { buy, fxRate } = getFxRate(rates, 0);
  const balance = activeAccount?.balance ?? 0;
  const history = activeAccount?.history ?? [];

  const cadBalance = toHuman(buy * balance * fxRate, true);
  const profit = calculateProfit(balance, history, rates);
  const profitCut = profit.toFixed(1);
  const profitDisplay = (profit < 1 ? "< .1" : profitCut.toString())
  return (
    <div className={styles.balanceAndProfit}>
      <div className={styles.illustrationMobile}>
        <img src={illustrationMobile} />
      </div>
      <div className={`${styles.balanceZone}`}>
        <Header as="h5" className={"appTitles"} >
            <FormattedMessage {...translate.balanceTitle} />
        </Header>
        <img src={illustration} className={styles.illustrationDesktop}/>
        <div className={styles.cadBalance}>{cadBalance}</div>
        <div className={`${styles.cadBalanceCurrency} x1spaceAfter`}><FormattedMessage {...translate.cad} /></div>
      </div>
      <div className={ `${styles.profitZone} x1spaceBefore` }>
        <Header as="h5" className={"appTitles"}>
            <FormattedMessage {...translate.profitTitle} />
        </Header>
        <div><Icon name='arrow up' />{profitDisplay}%</div>
      </div>
    </div>
  )
}