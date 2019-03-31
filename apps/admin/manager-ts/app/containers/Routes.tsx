import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { TheCoinAccount } from 'containers/TheCoinAccount'
import { BrokerCAD } from 'containers/BrokerCAD'
import { NotFoundPage } from './NotFoundPage';

export function Routes() {
	const brokerCad = `/${BrokerCAD.AccountName}`;
	return (
		<Switch>
			<Route path={brokerCad} key={brokerCad} component={BrokerCAD} />
			<Route component={TheCoinAccount} />
			<Route key="default" component={NotFoundPage} />
		</Switch>
	)
}
