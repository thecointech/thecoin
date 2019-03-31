import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Header, Button } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { toHuman } from '@the-coin/utilities'
import { selectFxRate, ContainerState as FxRate } from 'containers/FxRate/selectors';
import { ContainerState } from 'containers/Account/types';
import * as FxActions from 'containers/FxRate/actions';
import * as AccountActions from 'containers/Account/actions';
import messages from './messages'
import { TransactionHistory } from './TransactionHistory';

type DispatchProps = AccountActions.DispatchProps & FxActions.DispatchProps;
type Props = ContainerState & DispatchProps & FxRate;

class BalanceClass extends React.PureComponent<Props, {}, null> {

  constructor(props)
  {
    super(props)

    this.doUpdateBalance = this.doUpdateBalance.bind(this);
  }

  doUpdateBalance(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
    this.props.updateBalance();
    this.props.beginUpdateFxRate();
  }

  // On load, update balance
	componentDidMount() {
    this.props.updateBalance();
  }

  render() {
    const { balance, history, historyLoading, updateHistory, buy, fxRate } = this.props;
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
				  <TransactionHistory transactions={history} transactionLoading={historyLoading} onRangeChange={updateHistory} />
        </div>
      </React.Fragment>
		);
  }
}

function mapDispatchToProps(dispatch: Dispatch) : DispatchProps {
  return {
    ...FxActions.mapDispatchToProps(dispatch),
    ...AccountActions.mapDispatchToProps(dispatch)
  } as DispatchProps
}

export const Balance = connect(selectFxRate, mapDispatchToProps)(BalanceClass);
