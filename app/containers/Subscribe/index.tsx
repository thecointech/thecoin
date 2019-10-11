import React from 'react';
import { Input, Button } from 'semantic-ui-react';
import { GetNewsletterApi } from 'containers/Services/BrokerCAD';
import styles from './index.module.css';
import { FormattedMessage } from 'react-intl';

const Subscribe = () => {

  const [email, setEmail] = React.useState('');
  const onInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.currentTarget.value), [setEmail]);
  const doSubscribe = React.useCallback(async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (email.indexOf('@') < 0) {
      alert('Please enter a valid email');
    } else {
      const api = GetNewsletterApi();
      const result = await api.newsletterSignup({
        email,
        confirmed: false,
      }) as any;
      if (!result.success) {
        alert('Signup failed: please contact support@thecoin.io');
      } else {
        alert('Signup success!');
      }
    }
  }, [email]);
  return (
    <div className={styles.search}>
      <Input 
        onChange={onInputChange}
        action={(
        <Button onClick={doSubscribe}>
          <FormattedMessage id="Subscribe.button" defaultMessage="Get Connected!" />
        </Button>)}
      placeholder="Your email" />
    </div>
  );
};

export default Subscribe;
