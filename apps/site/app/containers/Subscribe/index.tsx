import React, { useState } from 'react';
import { Input, Button, Message } from 'semantic-ui-react';
import { GetNewsletterApi } from 'api';
import styles from './styles.module.css';
import { FormattedMessage } from 'react-intl';
//import { Redirect } from 'react-router';


export const Subscribe = () => {
  const [errorinfos, setErrorinfos] = useState(true);
  const [confirminfos, setConfirminfos] = useState(true);
  const [validinfos, setValidinfos] = useState(true);
 
  const [email, setEmail] = React.useState('');
  const onInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.currentTarget.value), [setEmail]);
  const doSubscribe = React.useCallback(async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.preventDefault();

    if (email.indexOf('@') < 0) {
      setValidinfos(false);
      setErrorinfos(true);
      setConfirminfos(true);
    } else {
      const api = GetNewsletterApi();
      const result = await api.newsletterSignup({
        email,
        confirmed: false,
      }) as any;
      if (!result.success) {
        setValidinfos(true);
        setErrorinfos(false);
        setConfirminfos(true);
      } else {
        setValidinfos(true);
        setErrorinfos(true);
        setConfirminfos(false);
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
        <div>
          <Message color='orange' hidden={validinfos}>
            <FormattedMessage id="site.subscribe.email.invalid" 
                                    defaultMessage="Please enter a valid email" 
                                    description="Message we give a user when the subscription failed" />
          </Message>
          <Message color='red' hidden={errorinfos}>
            <FormattedMessage id="site.subscribe.email.error" 
                                    defaultMessage="Signup failed: please contact support@thecoin.io" 
                                    description="Message we give a user when the subscription failed (already subscribed or server)" />
          </Message>
          <Message color='olive' hidden={confirminfos}>
            <FormattedMessage id="site.subscribe.email.success" 
                                    defaultMessage="Success: check your emails" 
                                    description="Message we give a user when the subscription is a success" />
          </Message>
        </div>
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