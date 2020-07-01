const FirestorePort = 8377;

const isPortTaken = (port) =>
  new Promise(resolve => {
    const server = require('http')
      .createServer()
      .listen(port, () => {
        server.close()
        resolve(false)
      })
      .on('error', () => {
        resolve(port)
      })
  })

// Run once before any tests are setup
const globalSetup = async () => {
  // Set a global variable indicating whether or not our firestore instance is available
  process.env.FIRESTORE_EMULATOR = await isPortTaken(FirestorePort);
}
module.exports = globalSetup;
