import React from 'react';
import { Switch, Route } from 'react-router-dom';

import StepSelect from './Purchase/StepSelect'
import Purchase from './Purchase/Purchase'

import MainSales from './Sales/Main'
import Login from './Components/Login'

class Router extends React.Component {

	render() {
		// Generate the right sub-content depending on which page we're in.
		return (
            <Switch>
                <Route exact path='/' component={Login} />
                <Route path='/purchases' exact component={StepSelect} />
                <Route path='/purchases/:index' component={Purchase} />
                <Route path='/sales' component={MainSales} />
			</Switch>);
	}
}

export default Router;