import { ethers } from 'ethers';
import { TheSigner } from '../../SignerIdent'

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