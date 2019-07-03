import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

function getUrlParams(search: string) {
  let hashes = search.slice(search.indexOf('?') + 1).split('&');
  let params = {};
  hashes.map(hash => {
    let [key, val] = hash.split('=');
    params[key] = decodeURIComponent(val);
  });

  return params;
}

export interface IWindow extends Window {
  completeGauthLogin?: (query: string) => void;
}

export class GAuth extends React.PureComponent {
  state = {
    message: messages.tokenWaiting,
  };

  async componentWillMount() {
    let query = window.location.search;
    const params = getUrlParams(query);
    if (params && params['code']) {
      const code = params['code'];
      const opener: IWindow = window.opener;
      if (opener && opener.completeGauthLogin) {
				opener.completeGauthLogin(code);
				this.setState({ message: messages.tokenSuccess });
				
      } else {
        // If we can't call that function, set the cookie data instead
        document.cookie = `gauth=${encodeURI(code)}; path=/`;
				this.setState({ message: messages.cookieSuccess });
      }
			//setTimeout(() => window.close(), 1500);

    } else {
      this.setState({ message: messages.tokenFailure });
    }
  }

  render() {
    return <FormattedMessage {...this.state.message} />;
  }
}
