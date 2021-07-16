import React, { useState, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { getUrlParameterByName } from '../../../../utils/localState';
import { IWindow } from './googleUtils';

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
  cookieSuccess: {
    defaultMessage: 'Authentication passed, please return to your account and complete connecting to google',
    description: 'app.storeOnline.google.cookieSuccess'}
});

export const GAuth = () => {

  const [message, setMessage] = useState(translations.tokenWaiting);

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
        // If we can't call that function, set the cookie data instead
        document.cookie = `gauth=${encodeURI(code)}; path=/`;
				setMessage(translations.cookieSuccess);
      }
			//setTimeout(() => window.close(), 1500);

    } else {
      setMessage(translations.tokenFailure);
    }
  }, [])

    return <FormattedMessage {...message} />;
}
