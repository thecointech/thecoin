import * as React from 'react';
import { connect } from 'react-redux';
import { Header, Button } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { toHuman } from '@the-coin/utilities'
import { selectFxRate, getFxRate, ContainerState as FxRates } from 'containers/FxRate/selectors';
import { ContainerState } from 'containers/Account/types';
import * as FxActions from 'containers/FxRate/actions';
import * as AccountActions from 'containers/Account/actions';
import messages from './messages'
import { TransactionHistory } from './TransactionHistory';

interface  MyProps {
  dispatch: AccountActions.DispatchProps
  account: ContainerState
}

type Props = MyProps & FxActions.DispatchProps & FxRates;

class BalanceClass extends React.PureComponent<Props, {}, null> {

  constructor(props)
  {
    super(props)
    this.doUpdateBalance = this.doUpdateBalance.bind(this);
  }

  doUpdateBalance(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
    this.props.dispatch.updateBalance();
    //this.props.beginUpdateFxRate();
  }

  // On load, update balance
	componentDidMount() {
    this.props.dispatch.updateBalance();
  }

  render() {
    const { account, dispatch, rates } = this.props;
    const { buy, fxRate } = getFxRate(rates, Date.now());
    const { balance, history, historyLoading } = account;
    const cadBalance = toHuman(buy * balance * fxRate);
    return (
      <React.Fragment>
        <Header as='h1'>
          <Header.Content>
            <FormattedMessage {...messages.header} 
              values={{
                balance: cadBalance
              }}/>
            </Header.Content>
          </Header>
        <Button onClick={this.doUpdateBalance}>UPDATE BALANCE</Button>
        <div>
				  <TransactionHistory transactions={history} rates={rates} transactionLoading={historyLoading} onRangeChange={dispatch.updateHistory} />
        </div>
      </React.Fragment>
		);
  }
}

export const Balance = connect(selectFxRate, FxActions.mapDispatchToProps)(BalanceClass);
