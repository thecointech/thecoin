import * as React from 'react';

import { Switch, Route } from 'react-router-dom';

import { TheCoinAccount } from 'containers/TheCoinAccount'
import { NotFoundPage } from './NotFoundPage';


export function Routes() {
	return (
		<Switch>
			<Route path="/brokercad" key="brokercad" component={NotFoundPage} />
			<Route component={TheCoinAccount} />
		</Switch>
	)
}
