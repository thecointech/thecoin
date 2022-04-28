import React, { useState } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Form, Header, Button, List, Message } from 'semantic-ui-react';
import { UxAddress } from '@thecointech/shared/components/UX/Address';
import { getShortCode, NormalizeAddress } from '@thecointech/utilities';
import { createReferrer, getReferrersCollection, VerifiedReferrer } from '@thecointech/broker-db/referrals';
import { getSigner } from '@thecointech/signers';
import { usePromiseSubscription } from '@thecointech/shared';

const header = defineMessage({defaultMessage: 'Verify an Account', description: "Title message on Verify page"});
const subHeader = defineMessage({defaultMessage: 'A verified account can refer other accounts.', description: "Subtitle explains what verified accounts can do"});
const labelAccount = defineMessage({ defaultMessage: 'Account to Verify', description: "Label for account number input" });
const buttonVerify = defineMessage({ defaultMessage: 'VERIFY ACCOUNT', description: "Button sets account number as verified" });

export const VerifyAccount = () => {

  const [account, setAccount] = useState<MaybeString>();
  const [forceValidate, setForceValidate] = useState(false);
  const [verifiedAccounts, error, isPending] = usePromiseSubscription(async () => {
    const allDocs = await getReferrersCollection().get();
    return [...allDocs.docs].map(d => d.data())
  }, undefined);

  return (
    <React.Fragment>
      <Form>
        <Header as="h1">
          <Header.Content>
            <FormattedMessage {...header} />
          </Header.Content>
          <Header.Subheader>
            <FormattedMessage {...subHeader} />
          </Header.Subheader>
        </Header>
        <UxAddress
          intlLabel={labelAccount}
          onValue={setAccount}
          forceValidate={forceValidate}
        />
        <Button disabled={isPending} onClick={async () => {
          setForceValidate(true);
          if (!account)
            return;
          const code = await verifyAccount(account);
          if (code) setAccount('');
        }}>
          <FormattedMessage {...buttonVerify} />
        </Button>
      </Form>
      <Message
        hidden={!error}
        header="An error occured"
        content={error?.toString()}
      />
      <VerifiedAccountList accounts={verifiedAccounts} />
    </React.Fragment>
  );
}

const VerifiedAccountList = ({accounts}: { accounts?: VerifiedReferrer[] }) => {
  if (accounts === undefined)
    return <Message>Please wait, loading</Message>
  if (accounts.length === 0)
    return <Message>No verified accounts found</Message>

  return (
    <List divided relaxed>
    {
      accounts.map(account => {
        const code = getShortCode(account.signature);
        return (
          <List.Item key={account.address}>
            <List.Content>
              <List.Header>{code}</List.Header>
              {account.address}
            </List.Content>
          </List.Item>
        )
      })
    }
    </List>
  )
}

async function verifyAccount(address: string) {

  if (!address || address.length === 0)
    return false;

  // We sign this address to show we approve of it
  const signer = await getSigner("BrokerCAD")
  const naddress = NormalizeAddress(address);
  const signature = await signer.signMessage(naddress)

  // await setUserVerified(signature, address, DateTime.now());
  const code = await createReferrer(signature, address);
  alert('Done');
  return code;
}
