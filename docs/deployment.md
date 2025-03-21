TheCoin is (currently) a series of micro-services connected together.

## System setup require prior to deployment

First steps:
install python (currently 3.11)
install node (currently v22)
  run `corepack enable`
install gcloud CLI and `gcloud auth login`
use tools/deploy/create-deployer.sh: Generate service accounts for deploying to GAE, one for rates-service & one for broker-cad.  Run the script from outside the repository as it will cache service account files in a local/relative folder.

setup yarn for publishing Github packages:
  Login to Github, create a new PAT with 'write:packages' permission
  Save the PAT to ~/.npmrc

You also need to login to firebase.  Navigate to root folder and run `yarn firebase login`

Our system is built to be deployed on Google App Engine (GAE).  The services are deployed as standard environment on GAE, and the websites are deployed to Firebase Hosting.

Each deployment app (rates/broker/site/nft) needs a GAE configuration for each environment (test/beta|prod).  The GAE configuration is used to set the deployment target for all the apps, deploying at the same time. See https://medium.com/google-cloud/how-to-use-multiple-accounts-with-gcloud-848fdb53a39a for how to create new configs.

#### Caveate BETA|PROD:
Our BETA services (rates/broker) are assigned a specific version to differentiate them from prod.  Unfortunately, we cannot specify a version using configs on GAE.   The beta environments are deployed to prod and the version is specified within the `deploy.ts` deployment scripts.

NOTE: nft site does not currently support `beta` as we are still pre-alpha for that project.

#### Selecting the right Config when deploying an app.
The configuration name to switch to when deploying an app should be set in the .env file.  This is how we send prodtest to `tc-nft-testing`, and prod to `tc-nft` using the same deploy command.  Eg, if you create a config for deploying rates-service to the prodtest project, in the prodtest file set:

`GCLOUD_RATES_CONFIG=rates-testing`

In the deployment script for rates-service, there is a setup call to `SetGCloudConfig('GCLOUD_RATES_CONFIG')`, which in this example will set the current gcloud configuration to `rates-testing`.


Because the app/landing websites are a pair, they are hosted under the same project.  This means these sites also have a connection in their `.firebaserc` files to specify which app in the hosting they deploy to.

The NFT site does not have this connection because it is a stand-alone website.

## Building

All that is needed to build is to run `yarn build` in the root folder.  This will clean, generate files, and run the build command on each project.

#### To Consider

Currently, the build command on root behaves slightly differently than it would in the child packages.  On the root, it cleans/gens/builds.  In the packages, it just builds.  It would be nice if the packages were refactored to be consistent; `yarn build` anywhere runs `clean/gen/build` for that package.  We could rename our build commands for consistency: each package has `clean`, `build:generate`, and `build:src` command, and the build command just calls these.

It is important that the root command call `clean` on all packages before running build: this is to ensure that no un-spec'ed dependencies exist between projects that may confuse things (eg - a package building that imports from a package that has not yet been re-built).

## How to deploy

In the root folder, run `yarn deploy:<environment>`.  By default this will increment patch version in each package, and deploy to GitHub packages & GAE.

## Deployment steps.

The deployment happens in 2 stages:

First, the libraries are deployed.

### Publishing Packages

We publish to Github Packages
 1. Authenticate with Github
   a. Generate a PAT (classic)
   b. Lerna doesn't appear to use yarn for publishing, so set auth in `~/.npmrc` (NOTE - this doesn't appear to work for linux, use the PAT as password with asked for login credentials)

Next, the apps are deployed.
## Things to Deploy

Apps deploy to GAE, libraries to github packages.

Contracts:
 - It is important that contracts are deployed first.  When a contract is deployed, it's address is written into a json file that is included with the code when deployed.
 - Contracts should be deployed once and so are not included in our deployments.  Our core contract may be upgraded, but that is a manual process and unrelated to regular deployments.

Libraries:
 - The libraries are hosted on github packages, and must be deployed (published) before the services

Apps:

 - rates-service: Simple service to periodically update exchange rates.
 - broker-cad: Backend server to store & process buy/sell orders.
 - site-landing: Static landing website, connects to broker
 - site-app: Static App website.  Connects to broker & rates.
 - site-wallet: [TODO] Static website runs wallet code. Runs site-app in a sandboxed iframe.

 - nft-service: Simple service handles claiming/updating NFT's
 - site-nft: Website to match



## Authentication

https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages

To upload to Github Packages, add your GH PAT token to your global .npmrc file

The GAE apps need an .npmrc file co-located with the app to allow installing from GitHub packages (from GAE).  To ease maintenance, we store a single .npmrc file with no secret in /tools/.npmrc.  The deployment automatically fills this in with the set key.  This file is then copied to the deploying folder, and the secret injected into the file prior to publishing.

These files are then ignored, so we do not have any files committed into Git that could at any point have our secrets exposed.

## Environment Vars

-All- configuration information is stored in env files. The location of the .env files is under a folder specified in the environment variable THECOIN_ENVIRONMENTS.  We also store example (spec) .env files under the folder `<root>/environments`.  When loading a .env file, we first query the external location, then the git folder for the file.  It should (may) be possible to do some actions (eg - build and test vs published data) by loading the git folder, but for publishing the engineer will need to fill in all the approriate keys etc.

To select which config to use, we set the environment variable CONFIG_NAME.  Each build step (webpack, deploy etc) calls `@thecointech/setenv` to load the appropriate config from this variable, and ensures that the deployment goes to the correct app engine etc.

The script `<root>/tools/predeploy.ts` contains some useful actions that are used to deploy to GAE.

For GAE deploys, there is also a build step called `copyEnvVarsLocal` that copies the contents of the active `.env` file local to the deploy (while stripping wallet keys for safeties sake).
