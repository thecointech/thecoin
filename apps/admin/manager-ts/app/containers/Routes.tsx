import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { TheCoin } from 'containers/TheCoinAccount'
import { BrokerCAD } from 'containers/BrokerCAD'
import { NotFoundPage } from './NotFoundPage';

import { DispatchProps, mapDispatchToProps } from '@the-coin/components/containers/PageSidebar/actions';
import { SidebarMenuItem, MapMenuItems } from '@the-coin/components/containers/PageSidebar/types';
import { connect } from 'react-redux';

type MyProps = {}
type Props = MyProps & DispatchProps;

const ConstantSidebarItems: SidebarMenuItem[] = 
[
	{
		link: {
			name: "TheCoin",
			to: TheCoin.AccountName
		}
	},
	{
		link: {
		  to: false,
		  name: 'Divider',
		},
	},
	{
		link: {
			name: "BrokerCAD",
			to: BrokerCAD.AccountName
		}
	}
];
  
  
class RoutesClass extends React.PureComponent<Props, {}, null> {

	generateSidebarItems(): SidebarMenuItem[] {
		return MapMenuItems(ConstantSidebarItems, "/");
	  } 

	componentDidMount() {
		this.props.setRootGenerator(this.generateSidebarItems);
	}

	componentWillUnmount() {
		this.props.setRootGenerator(null);
	}

	render() {
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
}

const Routes = connect(null, mapDispatchToProps)(RoutesClass);
export { Routes }