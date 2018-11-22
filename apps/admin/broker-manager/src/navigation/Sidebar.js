import React, { Component } from 'react';
import { withRR4 } from 'react-sidenav/withRR4';
import { Nav, NavText } from 'react-sidenav';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

const SideNav = withRR4();

class Sidebar extends Component {
	render() {
		const { account, purchaseKeys } = this.props;
		const userName = account == null ? 'Log In' : account.address;
		const purchaseLinks = purchaseKeys.map((key, index) => {
			const kid = 1 + (index + 1) / 10;
			const name = key.split('/').pop();
			const linkTo = `/purchases/${index}`
			return (
				<Nav id={index} key={index} >
					<Link to={linkTo}>{name}</Link>
				</Nav>);
		});

		const nb = <Nav id="purchases"></Nav>

		return (
			<div style={{ background: '#2c3e50', color: '#FFF', width:'256', overflow:'hidden' }}>
					<Link to="">{userName}</Link>
					<hr />
					<Link to="/purchases">Purchases</Link>
					{purchaseLinks}
					<hr />
					<Nav id="Sales">
						<NavText>Sales</NavText>
						<Nav id="list" />
					</Nav>
			</div >
		);
	}
}
const mapStateToProps = state => ({
	purchaseKeys: state.PurchasesRedux.keys,
	account: state.AccountsRedux.account
});

export default connect(mapStateToProps)(Sidebar);
