import React from 'react';
import { Input, Button } from 'semantic-ui-react';
import { GetNewsletterApi } from 'api';
import styles from './styles.module.css';
import { FormattedMessage } from 'react-intl';
//import { Redirect } from 'react-router';

export const Subscribe = () => {

  const [email, setEmail] = React.useState('');
  const onInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.currentTarget.value), [setEmail]);
  const doSubscribe = React.useCallback(async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.preventDefault();

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
        //return <Redirect to='/login'  />
      }
    }
  }, [email]);
  return (
    <div className={styles.subscribeBlock}>
      <span className={styles.subContainer}>
          <h3>
            <FormattedMessage id="site.subscribe.description" 
                              defaultMessage="The future is better because of you & us. Subscribe to our newsletter:" 
                              description="Title for the bottom subscription part for the site" />
          </h3>
      </span>
      <span className={styles.search}>
        <Input
          id='subscribeField'
          onChange={onInputChange}
          action={(
            <Button onClick={doSubscribe} secondary>
              <FormattedMessage id="site.subscribe.button" 
                                defaultMessage="Subscribe" 
                                description="Button for the bottom subscription part for the site" />
            </Button>)}
          placeholder="Your email" />
      </span>
    </div>
  );
};