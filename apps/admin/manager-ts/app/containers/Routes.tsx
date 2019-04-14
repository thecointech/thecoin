import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { TheCoin } from 'containers/TheCoinAccount'
import { BrokerCAD } from 'containers/BrokerCAD'
import { NotFoundPage } from './NotFoundPage';

export function Routes() {
	const brokerCad = `/${BrokerCAD.AccountName}`;
	const theCoin = `/${TheCoin.AccountName}`;
	return (
		<Switch>
			<Route path={brokerCad} key={brokerCad} component={BrokerCAD} />
			<Route path={theCoin} key={theCoin} component={TheCoin} />
			<Route key="default" component={NotFoundPage} />
		</Switch>
	)
}
