import webpack, { type Configuration } from 'webpack';
import { getEnvVars } from '@thecointech/setenv';

// These addresses come from the .env files for the current CONFIG_NAME.
// They are intentionally NOT resolved through getSigner: a production
// build must never need access to the BrokerCAD private key just to
// learn its address.
const required = [
  'WALLET_BrokerCAD_ADDRESS',
  'WALLET_BrokerTransferAssistant_ADDRESS',
] as const;

const env = getEnvVars();
const missing = required.filter(k => !env[k]);
if (missing.length) {
  throw new Error(`Missing required wallet addresses in env (CONFIG_NAME=${process.env.CONFIG_NAME}): ${missing.join(', ')}`);
}

export const signerConfig: Configuration = {
  plugins: [
    new webpack.DefinePlugin(
      Object.fromEntries(
        required.map(k => [`process.env.${k}`, JSON.stringify(env[k])])
      )
    ),
  ]
}
