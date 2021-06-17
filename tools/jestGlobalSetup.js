const net = require('net');
const { getEnvFile } = require('./setenv');
const { readFileSync } = require('fs');

const env = readFileSync(getEnvFile('devlive'));
const config = require('dotenv').parse(env)
const FirestorePort = config.FIRESTORE_EMULATOR_PORT;

var portInUse = function (port) {
  return new Promise(resolve => {
    var server = net.createServer(socket => {
      socket.write('Echo server\r\n');
      socket.pipe(socket);
    });

    server.listen(port, '127.0.0.1');
    server.on('error', () => {
      resolve(true);
    });
    server.on('listening', () => {
      server.close();
      resolve(false);
    });
  })
};

// Run once before any tests are setup
const globalSetup = async () => {
  // Set a global variable indicating whether or not our firestore instance is available
  process.env.FIRESTORE_EMULATOR_PORT = (await portInUse(FirestorePort))
    ? FirestorePort
    : false;
}

module.exports = globalSetup;
