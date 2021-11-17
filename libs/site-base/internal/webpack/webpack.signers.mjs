import { createRequire } from "module"; // Bring in the ability to create the 'require' method
import webpack from 'webpack';

// We also need to run mock_node here to ensure we get
// the right version of our signer (below)
const require = createRequire(import.meta.url);
require('../../../../__mocks__/mock_node');
const { getSigner } = require('@thecointech/signers');

// Now, we can use top-level await to fetch our addresses directly
// (this allows us to correctly inject addresses even for dynamic environments like dev:live)
async function getAddresses() {
  const brokerCad = await getSigner("BrokerCAD");
  const xferAsst = await getSigner("BrokerTransferAssistant");
  return {
    'process.env.WALLET_BrokerCAD_ADDRESS': await brokerCad.getAddress(),
    'process.env.WALLET_BrokerTransferAssistant_ADDRESS': await xferAsst.getAddress(),
  }
}

export default {
  plugins: [
    new webpack.DefinePlugin(
      // In some configurations (eg dev/devlive) we do not have
      // static addresses defined.  In these situations, fetch
      // the live signer and get it's address directly.
      // We can't do this every time because a production address
      // may not always exist
      process.env.WALLET_BrokerCAD_ADDRESS
        ? {}
        : await getAddresses()
    ),
  ]
}
