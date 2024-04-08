/**
 * Simple SPA that sends an appropriate email to trigger a deposit on testnet
 */

import * as React from 'react';
import { Button, Container, Form, Input } from 'semantic-ui-react';
import { UxAddress } from '@thecointech/shared/components/UX/Address';
import { DateTime } from 'luxon';
// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';
import { getEmailAddress, getEmailBody, getEmailTitle } from '@thecointech/email-fake-deposit';

export const Page = () => {

  const [address, setAddress] = React.useState<MaybeString>();
  const [amount, setAmount] = React.useState(0);
  const [forceValidate, setForcevalidate] = React.useState(false);
  const onSubmit = () => {
    setForcevalidate(true);
    if (!address || !amount) {
      return;
    }

    var link = `mailto:${getEmailAddress(address)}?`
    + "&subject=" + encodeURIComponent(getEmailTitle())
    + "&body=" + encodeURIComponent(getEmailBody(amount, DateTime.now()));

    window.open(link, '_blank');
  }
  return (
    <Form id={styles.app}>
      <Container className={styles.appContainer}>
        <UxAddress onValue={setAddress} forceValidate={forceValidate} />
        <Input onChange={(_, data) => setAmount(Number(data.value))} type="number" />
        <Button onClick={onSubmit} content="SUBMIT" />
      </Container>
    </Form>
  );
}
