import { sleep } from '@thecointech/async';

//
// In DevLive, we just exercise our code (so ignore blockpass itself)
// To do this, we start a service that calls our broker-service with updates
export function useBlockpass(_address: string, _email: string|undefined, onClose: () => void) {

  sleep(10000).then(onClose);
  return "ready";
}
