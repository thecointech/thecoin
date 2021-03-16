import { Firestore } from '@thecointech/types';

type TheCoinGlobals = {
  firestore: Firestore|null;
}
declare global {
  namespace globalThis {
    //  deepcode ignore no-var-keyword: var is necessary for this typing to work
    var __thecoin: TheCoinGlobals
  }
}
// initialize to empty
globalThis.__thecoin = {
  firestore: null,
}
