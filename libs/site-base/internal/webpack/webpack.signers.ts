import webpack, { type Configuration } from 'webpack';
import { getSigner } from '@thecointech/signers';
import { getEnvVars } from '@thecointech/setenv';

// Now, we can use top-level await to fetch our addresses directly
// (this allows us to correctly inject addresses even for dynamic environments like dev:live)
async function getAddresses() {
  const brokerCad = await getSigner("BrokerCAD");
  const xferAsst = await getSigner("BrokerTransferAssistant");
  return {
    'process.env.WALLET_BrokerCAD_ADDRESS': JSON.stringify(await brokerCad.getAddress()),
    'process.env.WALLET_BrokerTransferAssistant_ADDRESS': JSON.stringify(await xferAsst.getAddress()),
  }
}


// Helper to load TestDemoAccount wallet for prodtest builds
async function getTestDemoAccountWallet() {
  if (process.env.CONFIG_NAME !== 'prodtest') {
    return {};
  }

  const signer: any = await getSigner("TestDemoAccount");
  // Clear out any properties we don't want in the public site.
  delete signer.mnemonic;
  delete signer.provider;
  delete signer.chainCode;
  delete signer.fingerprint;
  delete signer.parentFingerprint;
  // Double-stringify: first to get JSON, second to make it a string literal for DefinePlugin
  const walletJson = JSON.stringify(JSON.stringify(signer));
  return { "process.env.PRODTEST_TESTDEMOACCOUNT_WALLET": walletJson };
}



export const signerConfig: Configuration = {
  plugins: [
    new webpack.DefinePlugin(
      // In some configurations (eg dev/devlive) we do not have
      // static addresses defined.  In these situations, fetch
      // the live signer and get it's address directly.
      // We can't do this every time because a production address
      // may not always exist
      {
        ...(getEnvVars().WALLET_BrokerCAD_ADDRESS
          ? {}
          : await getAddresses()
        ),
        ...(await getTestDemoAccountWallet()),
      }
    ),
  ]
}

