//import {GetStoredWallet} from '@the-coin/components/containers/Account/storageSync';
import { GetSecureApi } from 'containers/Services/BrokerCAD';
import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { IWindow } from './gauth';
import { GetStoredWallet } from '@the-coin/components/containers/Account/storageSync';
import { GooglePutRequest } from '@the-coin/broker-cad';
import { AccountState } from '@the-coin/components/containers/Account/types';

// Given a cookie key `name`, returns the value of
// the cookie or `null`, if the key is not found.
function getCookie(name: string) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
	return (parts.length == 2) ?
		decodeURI(parts.pop()!.split(";").shift()!) :
		'';
}

type MyProps = {
	account: AccountState
}

export class GoogleConnect extends React.PureComponent<MyProps> {

	state = {
		gauthUrl: "",
		gauthWindow: null as IWindow|null,
		timer: undefined as any
	}

	async componentWillMount()
	{
		// Ensure we don't have any unknown callbacks hanging about
		this.clearCallback();
		await this.fetchGAuthUrl()
		//this.setState({gauthUrl: url});
		//setTimeout( () => this.setupGauthLogin(url), 0)
	}

	componentWillUnmount() {
		this.clearWaitingTimer();
	}

	async fetchGAuthUrl() {
		try {
			const secureApi = GetSecureApi();
			const gauth = await secureApi.googleAuthUrl()	
			if (gauth && gauth.url)
			{
				this.setState({gauthUrl: gauth.url});
				return gauth.url;
			}
			else throw new Error("Oh No, wtf: " + JSON.stringify(gauth));
		}
		catch(err)
		{
			console.error(JSON.stringify(err));
			alert('Could not setup Google Login')
		}
		return '';
	}

	//
	// Setup the callback called by our opened auth window
	setupCallback() {
		const myWindow : IWindow = window;
		myWindow.completeGauthLogin = this.completeGauthLogin;
	}

	clearCallback() {
		const myWindow : IWindow = window;
		myWindow.completeGauthLogin = undefined
	}

	onInitiateLogin = (e) => {
		e.preventDefault();

		const {gauthUrl }= this.state;
		// First, setup the callback
		this.setupCallback();

		// Next trigger opening
		const gauthWindow = window.open(gauthUrl, name);
		if (gauthWindow) {
			this.setState({gauthWindow});
			//this.waitGauthLogin(gauthWindow);	
		}
		else {
			// TODO: verify non-popup flow
			window.location.assign(gauthUrl);
		}
	}

	// setupGauthLogin = (gauthUrl) => {
	// 	const button = document.getElementById(ButtonId);
	// 	if (!button) {
	// 		throw new Error('Could not find required document element');
	// 	}
	// 	button.onclick = (e) => {
	// 		e.preventDefault();
	// 		const gauthWindow = window.open(gauthUrl, name);
	// 		if (gauthWindow) {
	// 			this.setState({gauthWindow});
	// 			this.waitGauthLogin(gauthWindow);	
	// 		}
	// 	}
	// }

	waitGauthLogin = async (gauthWindow: IWindow) => {

		const myWindow : IWindow = window;
		var timer = setInterval(function() { 
			if(gauthWindow.closed) {
					clearInterval(timer);
					// Check, did we get our cookie?
					const cookieVal = getCookie('gauth')
					if (cookieVal)
						myWindow.completeGauthLogin!(cookieVal)
			}
		}, 1000);
		this.setState({timer})
	}

	clearWaitingTimer = () => {
		// Cancel the timer (if it's running)
		const { timer } = this.state;
		if (timer) {
			clearInterval(timer)
			this.setState({timer: 0})
		}
	}

	tryCompleteCookie = () => {
		// TODO: Support instances where
		// we were forced to use location = gauth
		// instead of opening a new brower.
	}

	completeGauthLogin = (token: string) => {
		this.clearWaitingTimer();
		this.clearCallback();
		// Do not download the decrypted wallet: instead
		// we read the wallet directly from LS and download that
		const {name} =this.props.account;
		const secureApi = GetSecureApi();
		const wallet = GetStoredWallet(name);
		if (!wallet) {
			// do something
			return;
		}
		const request: GooglePutRequest = {
			token: {
				token
			},
			wallet: JSON.stringify(wallet),
			walletName: name
		}

		// Prematurely disable the account,
		// because for some reason we aren't
		// getting the callbacks triggered below
		this.setState({gauthUrl: ""});

		secureApi.googlePut(request)
			.then((r) => {
				alert(r.statusText)
				if (r.status == 200) {
					alert(`Account ${name} successfully stored on your google drive`);
					
				}	
			})
			.catch((reason) => {
				console.error(JSON.stringify(reason));
			})	
	}

	render() 
	{
		const {gauthUrl} = this.state;

		const disabled = !gauthUrl;
		return (
			<Form>
				<Button onClick={this.onInitiateLogin} disabled={disabled}>Connect to Google</Button>
			</Form>
		);
	}
}