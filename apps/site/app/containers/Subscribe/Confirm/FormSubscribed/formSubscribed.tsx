import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import queryString from 'query-string';
import { SubscriptionDetails } from '@the-coin/types';
import { GetNewsletterApi } from 'api';
import { RouteComponentProps } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { useEffect } from 'react';
import styles from './styles.module.css';

function getInitialState(qs: string): SubscriptionDetails {
    const query = queryString.parse(qs);
    const id = query.id as string;
    return {
      id,
      confirmed: true
    };
  }

export const FormSubscribed = (props: RouteComponentProps) => {
      // Trigger immediate confirmation
    useEffect(() => {
        updateSubscription();
    }, []);

    const [details, setDetails] = React.useState(getInitialState(props.location.search));
    const onInputChange = React.useCallback((event: React.SyntheticEvent<HTMLInputElement>) => {
        const { value, name } = event.currentTarget;
        setDetails({
            ...details,
            [name]: value
        });
        }, [details, setDetails]);


    const updateSubscription = React.useCallback(async () => {
        const api = GetNewsletterApi();
        const result = await api.newsletterConfirm(details);
        setDetails(result.data);
    }, [details]);

    let intl = useIntl();
    const emailField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.email', defaultMessage:'Email'});
    const firstnameField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.firstname', defaultMessage:'First Name'});
    const lastnameField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.lastname', defaultMessage:'Last Name'});
    const countryField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.country', defaultMessage:'Country'});
    const cityField = intl.formatMessage({ id: 'site.subscribe.confirmation.form.city', defaultMessage:'City'});
    const subCheckbox = intl.formatMessage({ id: 'site.subscribe.confirmation.form.subcheckbox', defaultMessage:'I want to receive the newsletter'});
        
    return (
        <>
            <Form className={styles.formStyle}>
                <Form.Input onChange={onInputChange} placeholder={emailField} value={details.email} name="email" />
                <Form.Input onChange={onInputChange} placeholder={firstnameField} value={details.firstName} name="firstName" />
                <Form.Input onChange={onInputChange} placeholder={lastnameField} value={details.lastName} name="lastName" />
                <Form.Input onChange={onInputChange} placeholder={countryField} value={details.country} name="country" />
                <Form.Input onChange={onInputChange} placeholder={cityField} value={details.city} name="city" />
                <Form.Checkbox onChange={onInputChange} label={subCheckbox} checked={details.confirmed} name="confirmed" />
              
                <Button onClick={updateSubscription}>
                  <FormattedMessage id="site.subscribe.confirmation.button" defaultMessage="Update Details!" />
                </Button> 
              </Form>
            
        </>
    );
}