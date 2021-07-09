import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { getUrlParameterByName } from '../../../../utils/localState';
import { IWindow } from './googleUtils';

export const GAuth = () => {

  const [message, setMessage] = useState(messages.tokenWaiting);

  useEffect(() => {
    const code = getUrlParameterByName('code');
    if (code) {
      const opener = window.opener as IWindow;
      if (opener && opener.completeGauthLogin) {
				opener.completeGauthLogin(code);
        setMessage(messages.tokenSuccess);
        // Attempt close.  If this fails, hopefully
        // the message lets people know  they can ignore this page.
        window.close()
      } else {
        // If we can't call that function, set the cookie data instead
        document.cookie = `gauth=${encodeURI(code)}; path=/`;
				setMessage(messages.cookieSuccess);
      }
			//setTimeout(() => window.close(), 1500);

    } else {
      setMessage(messages.tokenFailure);
    }
  }, [])

    return <FormattedMessage {...message} />;
}
