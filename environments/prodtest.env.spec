#
# Environment configuration for deployments to the testing GAE project
#

NODE_ENV=production
SETTINGS=testing

#
# Cross-site references
URL_SITE_APP=https://tccc-testing.web.app
URL_SITE_LANDING=https://tccc-testing-landing.web.app

URL_SERVICE_BROKER=https://tccc-testing.nn.r.appspot.com/api/v1
URL_SERVICE_RATES=https://rates-service-testing.nn.r.appspot.com/api/v1

#
# The ethereum network our contract will be deployed to
DEPLOY_NETWORK=goerli
INFURA_PROJECT_ID=<AddThisHere>

#
# Connection to the IDX testnet.  This testnet is periodically wiped
# and should not be relied on to permanently store data.
# Can generate a new seed with
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CERAMIC_API=https://ceramic-clay.3boxlabs.com
CERAMIC_SEED=<SemiPermanentSeed>

#
# GCloud configurations should be setup to allow deploying to each target.
# See https://medium.com/google-cloud/how-to-use-multiple-accounts-with-gcloud-848fdb53a39a
GCLOUD_LANDING_CONFIG=landing-testing
GCLOUD_APP_CONFIG=app-testing

#
# Wallets used by testing environment
# If you want to regenerate these for any reason,
# run the script ../tools/createWallets.ts
# To view details (address/mnemonmic/key) run ../tools/logMnemonic

# not-encrypted versions of keys (to be removed once we have
# figured out how to do async wallet construction in truffle)
WALLET_Owner_KEY=<AddThisHere>
WALLET_Owner_MNEMONIC=<AddThisHere>

WALLET_Owner_PATH=<AddThisHere>
WALLET_Owner_PWD=<AddThisHere>
WALLET_TheCoin_PATH=<AddThisHere>
WALLET_TheCoin_PWD=<AddThisHere>
WALLET_TCManager_PATH=<AddThisHere>
WALLET_TCManager_PWD=<AddThisHere>
WALLET_Minter_PATH=<AddThisHere>
WALLET_Minter_PWD=<AddThisHere>
WALLET_Police_PATH=<AddThisHere>
WALLET_Police_PWD=<AddThisHere>
WALLET_BrokerCAD_PATH=<AddThisHere>
WALLET_BrokerCAD_PWD=<AddThisHere>
WALLET_BrokerTransferAssistant_PATH=<AddThisHere>
WALLET_BrokerTransferAssistant_PWD=<AddThisHere>
WALLET_client1_PATH=<AddThisHere>
WALLET_client1_PWD=<AddThisHere>
WALLET_client2_PATH=<AddThisHere>
WALLET_client2_PWD=<AddThisHere>
WALLET_client3_PATH=<AddThisHere>
WALLET_client3_PWD=<AddThisHere>
