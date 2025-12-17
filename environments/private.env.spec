#
# The list of env variables that the private version should define
#

#
# prod:test fetches live stockmarket data, so needs this key
FINNHUB_API_KEY=<SetAPIKey>
MAILJET_API_KEY=<SetAPIKey>
TRADIER_API_KEY=<SetAPIKey>

#
# The ethereum network our contract will be deployed to
INFURA_PROJECT_ID=<AddThisHere>

#
# Connection to the IDX testnet.  This testnet is periodically wiped
# and should not be relied on to permanently store data.
# Can generate a new seed with
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CERAMIC_URL=https://ceramic-clay.3boxlabs.com
CERAMIC_SEED=<SemiPermanentSeed>

#
# API Key to pull user data into local DB
BLOCKPASS_API_KEY=<GetKeyFromBlockpass>
BLOCKPASS_WEBHOOK_SECRET=<SetASecretToBePassed>

#
# Wallets used by testing environment
# If you want to regenerate these for any reason,
# Generate wallets with  - ../tools/createWallets.ts
# Log details with       - yarn ts-node .\tools\logMnemonic.ts

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
WALLET_Client1_PATH=<AddThisHere>
WALLET_Client1_PWD=<AddThisHere>
WALLET_Client2_PATH=<AddThisHere>
WALLET_Client2_PWD=<AddThisHere>
WALLET_NFTMinter_PATH=<AddThisHere>
WALLET_NFTMinter_PWD=<AddThisHere>
