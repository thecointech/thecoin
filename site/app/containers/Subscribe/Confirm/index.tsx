import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { GetNewsletterApi } from 'containers/Services/BrokerCAD';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import { BrokerCAD } from '@the-coin/types/lib/BrokerCAD';

import styles from '../../../styles/base.css';
import { RouteComponentProps } from 'react-router';

function getInitialState(qs: string) : BrokerCAD.SubscriptionDetails
{
  const query = queryString.parse(qs);
  const id = query.id as string;
  return {
    id,
    confirmed: true
  };
}
export const Confirm = (props: RouteComponentProps) => {

  const [hasUpdated, setUpdated] = React.useState(false);
  const [details, setDetails] = React.useState(getInitialState(props.location.search));
  const onInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const {value, name} = event.currentTarget;
    setDetails({
      ...details,
      [name]: value
    });
  }, [details, setDetails]);
  const updateSubscription = React.useCallback(async () => {
    const api = GetNewsletterApi();
    const result = await api.newsletterConfirm(details);
    setDetails(result);
    console.log("subscribed: " + result.confirmed);
    setUpdated(!!result);
  }, [details]);

  // Trigger immediate confirmation
  useEffect(() => {
    updateSubscription();
  }, []);

  return (
    <div>
      {
        hasUpdated ? 
          <h4>Your subscription has been confirmed</h4> :
          <h4>Please wait - we are confirming your subscription</h4>
      }
      We would love to get to know you better!  Would you mind letting us know your details?
      <Form className={styles.FormStyle}>
        <Form.Input onChange={onInputChange} placeholder="Email" value={details.email} name="email" />
        <Form.Input onChange={onInputChange} placeholder="First Name" value={details.firstName} name="firstName" />
        <Form.Input onChange={onInputChange} placeholder="Last Name" value={details.lastName} name="lastName" />
        <Form.Input onChange={onInputChange} placeholder="Country" value={details.country} name="country" />
        <Form.Input onChange={onInputChange} placeholder="City" value={details.city} name="city" />
        <Form.Checkbox onChange={onInputChange} label="Yes, I want to connect with The Coin" checked={details.confirmed} name="confirmed" />
      </Form>
      <Button onClick={updateSubscription}>
          <FormattedMessage id="Subscribe.button" defaultMessage="Update Details!" />
        </Button>
    </div>)
};