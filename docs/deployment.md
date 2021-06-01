TheCoin is (currently) a series of micro-services connected together.

## System setup require prior to deployment

Each deployment app (rates/broker/site/nft) needs a GAE configuration.  In the appropriate environment file for each configuration.  See https://medium.com/google-cloud/how-to-use-multiple-accounts-with-gcloud-848fdb53a39a for how to create new configs.

Set the variables to the name of the config in the env file for the appropriate deployment.  Eg, if you create a config for deploying rates-service to the prodtest project, in the prodtest file set:

`GCLOUD_RATES_CONFIG=rates-testing`

The websites (app/landing) also have a connection in their `.firebaserc` files to specify which app in the hosting they deploy to.

## How to deploy

In the root folder, run `yarn deploy:<environment>`.  By default this will increment patch version in each package, and deploy to GitHub packages & GAE.

[TODO] - use lerna to increment version.

## Things to Deploy

Apps deploy to GAE, libraries to github packages.s

Contracts:
 - It is important that contracts are deployed first.  When a contract is deployed, it's address is written into a json file that is included with the code when deployed.

Apps:

 - rates-service: Simple service to periodically update exchange rates.
 - broker-cad: Backend server to store & process buy/sell orders.
 - site-landing: Static landing website, connects to broker
 - site-app: Static App website.  Connects to broker & rates.
 - site-wallet: [TODO] Static website runs wallet code. Runs site-app in a sandboxed iframe.

 - nft-service: Simple service handles claiming/updating NFT's
 - site-nft: Website to match

Libraries:
 - There are a dozen libraries that need deploying

## Configuration

-All- configuration information is stored in env files under <root>/environments/<name>.  Each environment
file holds all data needed to run the system.

To select which config to use, we set the environment variable CONFIG_NAME.  This triggers loading the appropriate configuration, and ensures that the deployment goes to the correct app engine etc.

The script <root>/tools/predeploy.ts contains some useful actions that are used to deploy to GAE.
