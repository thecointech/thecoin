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

export const signerConfig: Configuration = {
  plugins: [
    new webpack.DefinePlugin(
      // In some configurations (eg dev/devlive) we do not have
      // static addresses defined.  In these situations, fetch
      // the live signer and get it's address directly.
      // We can't do this every time because a production address
      // may not always exist
      getEnvVars().WALLET_BrokerCAD_ADDRESS
        ? {}
        : await getAddresses()
    ),
  ]
}

