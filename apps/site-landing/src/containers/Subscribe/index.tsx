import React, { useState } from 'react';
import { Input, Button } from 'semantic-ui-react';
import { GetNewsletterApi } from '../../api';
import styles from './styles.module.less';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Result, StatusMessage } from './status';

const translations = defineMessages({
  description1 : {
    defaultMessage: 'The future is better because of you & us.',
    description: 'Footer CTA Part1'},
  description2 : {
      defaultMessage: 'Subscribe to our newsletter:',
      description: 'Footer CTA Part2'},
  button : {
    defaultMessage: 'Subscribe',
    description: 'site.subscribe.button: Button for the bottom subscription part for the site'}
});

export const Subscribe = () => {
  const [result, setResult] = useState(Result.Initial)
  const [email, setEmail] = React.useState('');
  const doSubscribe = React.useCallback(async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.preventDefault();

    if (email.indexOf('@') < 0) {
      setResult(Result.Invalid);
    } else {
      const api = GetNewsletterApi();
      const result = await api.newsletterSignup(email);
      setResult(
        result.status === 200 && result.data.success
          ? Result.Success
          : Result.Error
      )
    }
  }, [email]);

  return (
    <div id={styles.subscribeBlock}>
      <span className={styles.message}>
          <h3>
            <FormattedMessage tagName="div" {...translations.description1} />
            <FormattedMessage tagName="div" {...translations.description2} />
          </h3>
      </span>
      <span className={styles.subscribeForm}>
        <StatusMessage result={result} />
        <Input
          onChange={(_e, data) => setEmail(data.value)}
          placeholder="Your email" />

        <Button onClick={doSubscribe} secondary>
          <FormattedMessage {...translations.button} />
        </Button>
      </span>
    </div>
  );
};
