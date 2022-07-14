const { getEnvVars } = require('@thecointech/setenv');
const  netstat = require('node-netstat');

const config = getEnvVars('devlive');
const FirestorePort = config.FIRESTORE_EMULATOR_PORT;
const BlockchainPort = config.DEPLOY_NETWORK_PORT;

async function portInUse(port) {
  return new Promise((resolve, reject) => {
    const handler = netstat({
      filter: {
        protocol: 'tcp',
        local: {
          port: Number(port)
        }
      }
    }, item => {
      clearTimeout(timer);
      resolve(!!item)
      return false;
    })
    const timer = setTimeout(() => {
      handler.cancel();
      resolve(false)
    }, 50);
  })
}

// Run once before any tests are setup
const globalSetup = async () => {
  // Set a global variable indicating whether or not our firestore instance is available
  if (await portInUse(FirestorePort))
    process.env.FIRESTORE_EMULATOR_PORT = FirestorePort;

  // Set a global variable indicating whether or not our blockchain emulator is running
  if (await portInUse(BlockchainPort))
    process.env.DEPLOY_NETWORK_PORT = BlockchainPort;
}

module.exports = globalSetup;
