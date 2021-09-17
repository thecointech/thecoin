import { log } from '@thecointech/logging';
import { useEffect, useState } from 'react';
import { doSetup, onInitiateLogin, setupCallback } from './googleUtils';

type OnTokenCB = (token: string) => Promise<void>|void;
export const useGoogle = () : [boolean, (onToken: OnTokenCB) => void] => {
  const [gauthUrl, setAuthUrl] = useState(undefined as MaybeString|null);
  const [isTransmit, setTransmit] = useState(false);

  ////////////////////////////////////////////////////////////////
  // We ask the server for the URL we use to request the login code
  useEffect(() => doSetup(setAuthUrl), [setAuthUrl]);

  // Function to initiate transmission
  const onTransmit = (onToken: OnTokenCB) => {
    setTransmit(true);
    setupCallback((token) => {
      const r = onToken(token);
      if (r) {
        r.then(() => log.info("Completed backup operation on GDrive"))
         .catch(e => {
           log.error({exception: e.message}, `Exception GDrive::onToken: {exception} - ${e.stack}`);
           alert("An error occured.  We recommend backing up this account locally and contacting support@thecoin.io")
         })
         .finally(() => setTransmit(false))
      }
      else {
        setTransmit(false);
      }
    });
    onInitiateLogin(gauthUrl!);
  };
  return [isTransmit || !gauthUrl, onTransmit];
}

