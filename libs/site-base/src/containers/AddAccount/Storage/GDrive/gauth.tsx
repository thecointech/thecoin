import React, { useState, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { getUrlParameterByName } from '@thecointech/utilities/urls';
import { IWindow } from './googleUtils';
import { NoTabStoreList } from './NoTabStoreList';

const translations = defineMessages({
  tokenWaiting: {
    defaultMessage: 'Please wait - we are checking for authentication',
    description: 'app.storeOnline.google.tokenWaiting'},
  tokenSuccess: {
    defaultMessage: 'Thank you for completing Google Authorization: This window can now be closed.',
    description: 'app.storeOnline.google.tokenSuccess'},
  tokenFailure: {
    defaultMessage: 'This page expects to recieve google authentication information, but none was found.',
    description: 'app.storeOnline.google.tokenFailure'},
});

export const GAuth = () => {

  const [message, setMessage] = useState(translations.tokenWaiting);
  const [code, setCode] = useState<MaybeString>();

  useEffect(() => {
    const code = getUrlParameterByName('code');
    if (code) {
      const opener = window.opener as IWindow;
      if (opener && opener.completeGauthLogin) {
				opener.completeGauthLogin(code);
        setMessage(translations.tokenSuccess);
        // Attempt close.  If this fails, hopefully
        // the message lets people know  they can ignore this page.
        window.close()
      } else {
        // If we can't call that function, show the page
        // to allow uploading any local account
        setCode(code);
      }

    } else {
      setMessage(translations.tokenFailure);
    }
  }, [])

  return code
    ? <NoTabStoreList code={code} />
    : <FormattedMessage {...message} />;
}
