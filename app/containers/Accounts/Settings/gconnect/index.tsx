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
		const url = await this.fetchGAuthUrl()
		this.setupGauthLogin(url);
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

	setupGauthLogin = (gauthUrl) => {
		const button = document.getElementById("__OtherButton");
		if (!button) {
			throw new Error('Could not find required document element');
		}
		button.onclick = (e) => {
			e.preventDefault();
			const gauthWindow = window.open(gauthUrl, name);
			if (gauthWindow) {
				this.setState({gauthWindow});
				this.waitGauthLogin(gauthWindow);	
			}
		}
	}

	waitGauthLogin = async (gauthWindow: IWindow) => {

		const myWindow : IWindow = window;
		myWindow.completeGauthLogin = async (query: string) => {
			gauthWindow.close()
			this.completeGauthLogin(query)
		}
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

	tryCompleteCookie = () => {
		// TODO: Support instances where
		// we were forced to use location = gauth
		// instead of opening a new brower.
	}

	completeGauthLogin = async (token: string) => {
		// First, get our (encrypted) account
		const {name} =this.props.account;
		// Do not download the decrypted wallet: instead
		// we read the wallet directly from LS and download that
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
		secureApi.googlePut(request);
	}

	render() 
	{
		const {gauthUrl} = this.state;

		const disabled = !gauthUrl;
		return (
			<Form action="https://accounts.google.com/o/oauth2/v2/auth?access_type=online&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly&response_type=code&client_id=1006073898040-o2k0pj8l74i56qmqhoungtlgrpnl2728.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Faccounts%2Fgauth">
				{/*<button id="__CrayCrayButton" >Connect To Google</button>*/}
				<Button id="__OtherButton" disabled={disabled}>Connect to Google</Button>
			</Form>
		);
	}
}