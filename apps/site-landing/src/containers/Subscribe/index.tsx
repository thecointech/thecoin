import React, { useState } from 'react';
import { Input, Button, Message } from 'semantic-ui-react';
import { GetNewsletterApi } from '../../api';
import styles from './styles.module.less';
import { FormattedMessage } from 'react-intl';

export type Props = {
  Mobile: boolean;
}

const description = {  id:"site.subscribe.description",
                      defaultMessage:"The future is better because of you & us. Subscribe to our newsletter",
                      description:"Title for the bottom subscription part for the site"};
const button = {  id:"site.subscribe.button",
                      defaultMessage:"Subscribe",
                      description:"Button for the bottom subscription part for the site"};

const invalidEmail = {  id:"site.subscribe.email.invalid",
                      defaultMessage:"Please enter a valid email",
                      description:"Message we give a user when the subscription failed"};
const errorEmail = {  id:"site.subscribe.email.error",
                      defaultMessage:"Signup failed: please contact support@thecoin.io",
                      description:"Message we give a user when the subscription failed (already subscribed or server)"};
const successEmail = {  id:"site.subscribe.email.success",
                      defaultMessage:"Success: check your emails",
                      description:"Message we give a user when the subscription is a success"};


export const Subscribe = (props: Props) => {
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

  let idForContainer = styles.desktopContainer;
  let classForButton = "x4spaceLeft";
  if (props.Mobile){
    idForContainer = styles.mobileContainer;
    classForButton = "x4spaceBefore";
  }

  return (
    <div className={styles.subscribeBlock} id={idForContainer}>
      <span className={ `${styles.subContainer} x2spaceBefore x6spaceAfter` }>
          <h3>
            <FormattedMessage {...description} />
          </h3>
      </span>
      <span className={styles.search}>
        <div>
          <Message color='orange' hidden={validInfos}>
            <FormattedMessage {...invalidEmail}/>
          </Message>
          <Message color='red' hidden={errorInfos}>
            <FormattedMessage {...errorEmail} />
          </Message>
          <Message color='olive' hidden={confirmInfos}>
            <FormattedMessage {...successEmail} />
          </Message>
        </div>
        <Input
          onChange={onInputChange}
          placeholder="Your email" />

        <Button onClick={doSubscribe} secondary className={ classForButton }>
          <FormattedMessage {...button} />
        </Button>
      </span>
    </div>
  );
};
