const { getEnvVars } = require('@thecointech/setenv');
const { createConnection } = require('net');
const { join } = require('path');

const config = getEnvVars('development');
const devlive = getEnvVars('devlive');
const FirestorePort = devlive.FIRESTORE_EMULATOR_PORT;
const BlockchainPort = devlive.DEPLOY_NETWORK_PORT;

async function portInUse(port) {
  if (!port) return false;
  return new Promise(resolve => {
    const socket = createConnection({ host: '127.0.0.1', port: Number(port) });
    const finish = available => {
      socket.destroy();
      resolve(available);
    };
    socket.setTimeout(1000);
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
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

  process.env = {
    HARDHAT_CONFIG: join(__dirname, '../../contract-tools/build/hardhat.config.js'),
    ...process.env,
    ...config,
  };
}

module.exports = globalSetup;
