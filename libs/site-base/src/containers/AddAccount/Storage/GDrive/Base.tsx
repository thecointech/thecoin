import React, { useEffect, useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { ProviderChoice } from '../ProviderChoice';
import { onInitiateLogin, doSetup, setupCallback, AuthCallback } from './googleUtils';

import icon from './images/google.svg'

type Props = {
  busy?: boolean;
  text: MessageDescriptor;
  onAuth: AuthCallback;
}
export const GDriveBase = ({busy, text, onAuth}: Props) => {

  const [gauthUrl, setAuthUrl] = useState(undefined as MaybeString|null);
  const [isUploading, setIsUploading] = useState(false);

  ////////////////////////////////////////////////////////////////
  // We ask the server for the URL we use to request the login code
  useEffect(() => doSetup(setAuthUrl), [setAuthUrl]);

  const onConnectClick = () => {
    setIsUploading(true);
    setupCallback((token) => {
      const r = onAuth(token);
      if (r) {
        r.then(() => setIsUploading(false))
         .catch(() => setIsUploading(false))
      }
      else {
        setIsUploading(false);
      }
    });
    onInitiateLogin(gauthUrl!);
  };

  ////////////////////////////////////////////////////////////////
  return (
    <ProviderChoice
      onClick={onConnectClick}
      loading={isUploading || busy || gauthUrl === undefined}
      imgSrc={icon}
      txt={text}
    />
  );
}
