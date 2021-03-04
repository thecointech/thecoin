import React, { useCallback, useEffect, useState } from 'react';
import { Button, CheckboxProps, Form, InputOnChangeData } from 'semantic-ui-react';
import queryString from 'query-string';
import { GetNewsletterApi } from 'api';
import { useLocation } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import styles from './styles.module.less';
import { SubscriptionDetails } from '@the-coin/broker-cad';

export const FormSubscribed = () => {
  const id = useIdFromQuery();
  const [details, setDetails] = useState(undefined as SubscriptionDetails|undefined);
  const confirmed = !!details;

  // Trigger immediate confirmation
  useEffect(() => {
    confirmSubscription(id).then(setDetails);
  }, [id]);

  const onInputChange = useCallback((_event, data: InputOnChangeData|CheckboxProps) => {
    const { value, name, checked } = data;
    setDetails({
      email: "", // Our initial undefined state means
      ...details,
      [name]: value ?? checked
    });
  }, [details, setDetails]);

  let intl = useIntl();
  const emailField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.email', defaultMessage: 'Email' });
  const firstnameField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.firstname', defaultMessage: 'Given Name' });
  const lastnameField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.lastname', defaultMessage: 'Family Name' });
  const countryField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.country', defaultMessage: 'Country' });
  const cityField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.city', defaultMessage: 'City' });
  const subCheckbox = intl.formatMessage({ id: 'site.subscribe.confirmation.form.subcheckbox', defaultMessage: 'I want to receive the newsletter' });

  return (
    <>
      <Form className={styles.formStyle}>
        <Form.Input disabled={!confirmed} onChange={onInputChange} placeholder={emailField} value={details?.email ?? ""} name="email" />
        <Form.Input disabled={!confirmed} onChange={onInputChange} placeholder={firstnameField} value={details?.givenName ?? ""} name="givenName" />
        <Form.Input disabled={!confirmed} onChange={onInputChange} placeholder={lastnameField} value={details?.familyName ?? ""} name="familyName" />
        <Form.Input disabled={!confirmed} onChange={onInputChange} placeholder={countryField} value={details?.country ?? ""} name="country" />
        <Form.Input disabled={!confirmed} onChange={onInputChange} placeholder={cityField} value={details?.city ?? ""} name="city" />
        <Form.Checkbox disabled={!confirmed} onChange={onInputChange} label={subCheckbox} checked={details?.confirmed ?? true} name="confirmed" />

        <Button disabled={!confirmed} onClick={() => updateSubscription(id, details!)}>
          <FormattedMessage id="site.subscribe.confirmation.button" defaultMessage="Update Details!" />
        </Button>
      </Form>

    </>
  );
}

const useIdFromQuery = () => {
  const location = useLocation();
  const query = queryString.parse(location.search);
  return query.id as string;
}

const confirmSubscription = async (id: string) => {
  const api = GetNewsletterApi();
  const r = await api.newsletterDetails(id);
  if (r.status !== 200)
    return undefined;

  const details = {
    ...r.data,
    confirmed: true,
  };
  return await updateSubscription(id, details)
    ? details
    : undefined;
}

const updateSubscription = async (id: string, details: SubscriptionDetails) => {
  const api = GetNewsletterApi();
  const result = await api.newsletterUpdate(id, details);
  return result.status === 200;
}
