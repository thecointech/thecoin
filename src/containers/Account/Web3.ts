import { ethers } from 'ethers';
import { TheSigner } from '../../SignerIdent'
import { TheContract } from '@the-coin/utilities';

async function AddTheCoin(ethereum: any)
{
	const contract = await TheContract.GetContract();
	const tokenAddress = contract.address
	const tokenSymbol = 'THE'
	const tokenDecimals = 6
	const tokenImage = 'https://thecoin.io/favicon.ico'

	try {

		const added = await ethereum.sendAsync({
			method: 'wallet_watchAsset',
			params: {
				"type":"ERC20",
				"options":{
					"address": tokenAddress,
					"symbol": tokenSymbol,
					"decimals": tokenDecimals,
					"image": tokenImage,
				},
			},
			id: Math.round(Math.random() * 100000)
		});

		if (added) {
			console.log('Thanks for your interest!')
		} else {
			console.log('Your loss!')
		}
	}
	catch (err) {
		console.error(err);
	}
}

export async function ConnectWeb3()
{
	// NOTE!  Browser only!
	const win: any = window;
	const { ethereum, web3 } = win;
	if (ethereum) {
		try {
			// Request account access if needed
			await ethereum.enable();
			var provider = new ethers.providers.Web3Provider(web3.currentProvider);
			var signer = provider.getSigner();
			// add The Coin to the list of tokens displayed by MetaMask
			await AddTheCoin(ethereum);

			// Our local/stored version remembers it's address
			var address = await signer.getAddress();
			const theSigner: TheSigner = Object.assign(signer, { address });
			return theSigner;

		} catch (error) {
			// User denied account access...
			//this.setState({userMessage: "Cannot connect: user cancelled"});
			return null;
		}
	}
	// Legacy dapp browsers...
	else if (web3) {
		//win.web3 = new Web3(web3.currentProvider);
		// Acccounts always exposed
		//	web3.eth.sendTransaction({/* ... */});
	}
	// Non-dapp browsers...
	return null;
}