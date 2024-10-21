import { BrowserProvider } from 'ethers';
import { GetContract } from '@thecointech/contract-core';
import { getWeb3Type } from '../../utils/detection';

async function AddTheCoin(ethereum: any) {
  const contract = await GetContract();
  const tokenAddress = await contract.getAddress()
  const tokenSymbol = 'THE'
  const tokenDecimals = 6
  const tokenImage = 'https://thecoin.io/favicon.ico'

  try {

    const added = await ethereum.sendAsync({
      method: 'wallet_watchAsset',
      params: {
        "type": "ERC20",
        "options": {
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
      console.log('Maybe next time!')
    }
  }
  catch (err) {
    console.error(err);
  }
}

export async function ConnectWeb3() {

  const type = getWeb3Type();
  console.log(`Connecting to Web3: ${type}`);

  if (!type)
    throw new Error('Cannot connect');

  // NOTE!  Browser only!
  const win: any = window;
  const { ethereum, web3 } = win;
  if (ethereum) {
    try {
      // Request account access if needed
      await ethereum.enable();
      console.log("Ethereum Enabled");
      var provider = new BrowserProvider(web3.currentProvider);
      var signer = await provider.getSigner();
      console.log(`Connecting to signer: ${signer}`);
      if (type === 'Metamask') {
        // add The Coin to the list of tokens displayed by MetaMask
        await AddTheCoin(ethereum);
      };

      // Our local/stored version remembers it's address
      var address = await signer.getAddress();
      console.log(`Got Address: ${address}`);
      return { signer, address };

    } catch (error) {
      NotifyUserOfError(error);
      // User denied account access...
      return null;
    }
  }
  // Legacy dapp browsers...
  else if (web3) {
    console.warn("This browser is running an unsupported version of Web3: please update to latest");
    //win.web3 = new Web3(web3.currentProvider);
    // Acccounts always exposed
    //	web3.eth.sendTransaction({/* ... */});
  }
  // Non-dapp browsers...
  return null;
}

function NotifyUserOfError(error: any) {
  console.error("Cannot connect: " + JSON.stringify(error));
  // Can we get more info out of this?
  try {
    const erJson = JSON.parse(error)
    // Found by trial and error
    if (erJson.error?.code === -32503) {
      alert("Unable to Connect: Opera wallet is enabled but not connected\n\n(try removing and resetting current pairing)")
    }
    else if (erJson?.error?.message) {
      // Opera may have more diagnostics in here
      alert("Unable to Connect: \n\n" + erJson?.error?.message)
    }
    else {
      alert("We couldn't connect to your account - we don't know why.  If this is an error, please contact support@thecoin.io");
    }
  }
  finally
  {}
}
