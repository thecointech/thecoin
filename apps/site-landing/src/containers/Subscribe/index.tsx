import React, { useState } from 'react';
import { Input, Button, Message } from 'semantic-ui-react';
import { GetNewsletterApi } from '../../api';
import styles from './styles.module.less';
import { FormattedMessage } from 'react-intl';
//import { Redirect } from 'react-router';


export const Subscribe = () => {
  const [errorInfos, setErrorInfos] = useState(true);
  const [confirmInfos, setConfirmInfos] = useState(true);
  const [validInfos, setValidInfos] = useState(true);

  const [email, setEmail] = React.useState('');
  const onInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.currentTarget.value), [setEmail]);
  const doSubscribe = React.useCallback(async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.preventDefault();

    if (email.indexOf('@') < 0) {
      setValidInfos(false);
      setErrorInfos(true);
      setConfirmInfos(true);
    } else {
      const api = GetNewsletterApi();
      const result = await api.newsletterSignup({
        email,
        confirmed: false,
      }) as any;
      if (!result.success) {
        setValidInfos(true);
        setErrorInfos(false);
        setConfirmInfos(true);
      } else {
        setValidInfos(true);
        setErrorInfos(true);
        setConfirmInfos(false);
      }
    }
  }, [email]);
  return (
    <div className={styles.subscribeBlock}>
      <span className={ `${styles.subContainer} x2spaceBefore x6spaceAfter` }>
          <h3>
            <FormattedMessage id="site.subscribe.description"
                              defaultMessage="The future is better because of you & us. Subscribe to our newsletter:"
                              description="Title for the bottom subscription part for the site" />
          </h3>
      </span>
      <span className={styles.search}>
        <div>
          <Message color='orange' hidden={validInfos}>
            <FormattedMessage id="site.subscribe.email.invalid"
                                    defaultMessage="Please enter a valid email"
                                    description="Message we give a user when the subscription failed" />
          </Message>
          <Message color='red' hidden={errorInfos}>
            <FormattedMessage id="site.subscribe.email.error"
                                    defaultMessage="Signup failed: please contact support@thecoin.io"
                                    description="Message we give a user when the subscription failed (already subscribed or server)" />
          </Message>
          <Message color='olive' hidden={confirmInfos}>
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
