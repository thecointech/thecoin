import * as React from "react";
import { connect } from "react-redux";
import { Button } from "semantic-ui-react";
import { Grid } from "semantic-ui-react";

import { toHuman } from "@the-coin/utilities";
import { getFxRate } from "../../containers/FxRate/reducer";
import * as FxSelect from "../../containers/FxRate/selectors";
import * as FxActions from "../../containers/FxRate/actions";
import { AccountState } from "../../containers/Account/types";
import * as AccountActions from "../../containers/Account/actions";

import { TransactionHistory } from "../TransactionHistory";
import { Popup } from "semantic-ui-react";
import bank from "./bank.svg";
import styles from "./index.module.css";
import { calculateProfit } from "./profit";

interface MyProps {
  dispatch: AccountActions.DispatchProps;
  account: AccountState;
}

type Props = MyProps & FxActions.DispatchProps & FxSelect.ContainerState;

class BalanceClass extends React.PureComponent<Props, {}, null> {
  constructor(props: Props) {
    super(props);
    this.doUpdateBalance = this.doUpdateBalance.bind(this);
  }

  doUpdateBalance(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
    this.props.dispatch.updateBalance();
    console.log("UPDATE BALANCE CLICK");
  }

  componentDidMount() {}

  render() {
    const { account, dispatch, rates } = this.props;
    const { buy, fxRate } = getFxRate(rates, Date.now());
    const { balance, history, historyLoading } = account;
    const cadBalance = toHuman(buy * balance * fxRate, true);

    const rawProfit = calculateProfit(balance, history, rates);
    const profit = toHuman(rawProfit, true);


    return (
      <React.Fragment>
        <div className={styles.wrapper}>
          <Grid columns={2} stackable>
            <Grid.Row>
              <Grid.Column>
                <p className={styles.have}>
                  You have:{" "}
                  <span className={styles.balance}>${cadBalance}</span>{" "}
                  {profit < 1 ? (
                    <Popup
                      trigger={<img className={styles.bankIcon} src={bank} />}
                      content="Current Profit: < .1%"
                      position="top left"
                    />
                  ) : (
                    <Popup
                      trigger={<img className={styles.bankIcon} src={bank} />}
                      content={`Current Profit: $` + profit}
                      position="top left"
                    />
                  )}
                </p>
              </Grid.Column>
              <Grid.Column width={2}></Grid.Column>
            </Grid.Row>
          </Grid>

          <Button onClick={this.doUpdateBalance}>Update Balance</Button>

          <TransactionHistory
            transactions={history}
            rates={rates}
            transactionLoading={historyLoading}
            onRangeChange={dispatch.updateHistory}
          />
        </div>
      </React.Fragment>
    );
  }
}

export const Balance = connect(
  FxSelect.selectFxRate,
  FxActions.mapDispatchToProps
)(BalanceClass);
