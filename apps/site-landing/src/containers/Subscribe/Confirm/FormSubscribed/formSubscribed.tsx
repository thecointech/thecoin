import React, { useEffect, useState } from 'react';
import { Button, CheckboxProps, Form, InputOnChangeData } from 'semantic-ui-react';
import queryString from 'query-string';
import { GetNewsletterApi } from 'api';
import { useLocation } from 'react-router';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import styles from './styles.module.less';
import { SubscriptionDetails } from '@thecointech/broker-cad';
import { log } from '@thecointech/logging';

const translations = defineMessages({
  email : {
    defaultMessage: 'Email',
    description: 'site.subscribe.confirmation.form.email: label for email field'},
  firstname : {
    defaultMessage: 'Given Name',
    description: 'site.subscribe.confirmation.form.firstname: label for first name field'},
  lastname : {
    defaultMessage: 'Family Name',
    description: 'site.subscribe.confirmation.form.lastname: label for last name field'},
  country : {
    defaultMessage: 'Country',
    description: 'site.subscribe.confirmation.form.country: label for last name field'},
  city : {
    defaultMessage: 'City',
    description: 'site.subscribe.confirmation.form.city: label for city field'},
  subcheckbox : {
    defaultMessage: 'I want to receive the newsletter',
    description: 'site.subscribe.confirmation.form.subcheckbox: label for subcheckbox field'}
});

const BlankSubsData : SubscriptionDetails = {
  email: "",
  registerDate: 0,
};
export const FormSubscribed = () => {
  const id = useIdFromQuery();
  const [details, setDetails] = useState(BlankSubsData);
  const confirmed = !!details;

  // Trigger immediate confirmation
  useEffect(() => {
    confirmSubscription(id)
      .then(setDetails)
      .catch(log.error);
  }, [id]);

  const onInputChange = (_event: React.FormEvent<HTMLInputElement>, data: InputOnChangeData|CheckboxProps) => {
    const { value, name, checked } = data;
    setDetails(prevDetails => ({
      ...prevDetails,
      [name]: value ?? checked
    }));
  }

  let intl = useIntl();
  const emailField = intl.formatMessage(translations.email);
  const firstnameField = intl.formatMessage(translations.firstname);
  const lastnameField = intl.formatMessage(translations.lastname);
  const countryField = intl.formatMessage(translations.country);
  const cityField = intl.formatMessage(translations.city);
  const subCheckbox = intl.formatMessage(translations.subcheckbox);

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
  if (r.status !== 200 || !r.data?.email)
    return BlankSubsData;

  const details = {
    ...r.data,
    confirmed: true,
  }
  const confirmation = await updateSubscription(id, details);
  return confirmation
    ? details
    : BlankSubsData;
}

const updateSubscription = async (id: string, details: SubscriptionDetails) => {
  const api = GetNewsletterApi();
  const result = await api.newsletterUpdate(id, details);
  return result.status === 200;
}
