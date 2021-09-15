import { ThreeIdConnect } from '@3id/connect'

// Singleton
declare module globalThis {
  let __threeID: ThreeIdConnect;
}
// 3ID Connect uses an iframe to connect.  Does this mean
// we cannot have multiple active accounts simultaneously?
// TODO: Test account switching!
globalThis.__threeID = new ThreeIdConnect(process.env.THREEID_NETWORK)


export function get3idConnect() {
    // TODO: how do we connect to multiple accounts at the same time?!?
    //await globalThis.__threeID.connect(authProvider)
    return globalThis.__threeID;
}
