import React, { Component } from 'react';
import { withRR4 } from 'react-sidenav/withRR4';
import { Nav, NavText } from 'react-sidenav';
import { connect } from 'react-redux';

const SideNav = withRR4();

class Sidebar extends Component {
	render() {
		const { account, purchaseKeys } = this.props;
		const userName = account == null ? 'Log In' : account.address;
		const purchaseLinks = purchaseKeys.map((key, index) => {
			const kid = 1 + (index + 1) / 10;
			const name = key.split('/').pop();
			return (
				<Nav id={index} key={index} >
					<NavText id={index}>{name}</NavText>
				</Nav>);
		});

		return (
			<div style={{ background: '#2c3e50', color: '#FFF' }}>
				<SideNav highlightBgColor="#00bcd4">
					<Nav id="">
						<NavText>Login</NavText>
					</Nav>
					<hr />
					<Nav id="Purchases">
						<NavText>Purchases</NavText>
						{purchaseLinks}
		      </Nav>
				<hr />
				<Nav id="Sales">
					<NavText>Sales</NavText>
					<Nav id="list" />
				</Nav>
		    </SideNav>
		  </div >
		);
	}
}
const mapStateToProps = state => ({
	purchaseKeys: state.PurchasesRedux.keys,
	account: state.AccountsRedux.account
});

export default connect(mapStateToProps)(Sidebar);
