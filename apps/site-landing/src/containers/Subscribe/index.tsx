import React, { useState } from 'react';
import { Input, Button } from 'semantic-ui-react';
import { GetNewsletterApi } from '../../api';
import styles from './styles.module.less';
import { FormattedMessage } from 'react-intl';
import { Result, StatusMessage } from './status';


const description = {  id:"site.subscribe.description",
                      defaultMessage:"The future is better because of you & us. Subscribe to our newsletter",
                      description:"Title for the bottom subscription part for the site"};
const button = {  id:"site.subscribe.button",
                      defaultMessage:"Subscribe",
                      description:"Button for the bottom subscription part for the site"};

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
        result.status == 200 && result.data.success
          ? Result.Success
          : Result.Error
      )
    }
  }, [email]);


  return (
    <div id={styles.subscribeBlock}>
      <span className={ `${styles.subContainer} x2spaceBefore x6spaceAfter` }>
          <h3>
            <FormattedMessage {...description} />
          </h3>
      </span>
      <span className={styles.search}>
        <StatusMessage result={result} />
        <Input
          onChange={(_e, data) => setEmail(data.value)}
          placeholder="Your email" />

        <Button onClick={doSubscribe} secondary>
          <FormattedMessage {...button} />
        </Button>
      </span>
    </div>
  );
};
