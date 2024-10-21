import { Container, Dropdown, Form } from 'semantic-ui-react'
import { UxInput } from '@thecointech/shared/components/UX/Input';

import { payees, validate } from "@thecointech/site-app/src/containers/Accounts/BillPayments/payees";
import { useEffect, useState } from 'react';
import { TrainingReducer } from './state/reducer';

const translations = {
  accountNumer: {
    id: 'not-used',
    defaultMessage: 'Credit Card Number',
  },
}
const allPayees = payees;
//@ts-ignore
const visa = allPayees.find(p => p.text?.includes('VISA'));
const ccPayees = payees.filter(p => p.validate === visa?.validate);

export const CreditDetails = () => {
  const [payee, setPayee] = useState<string|undefined>();
  const [accountNumber, setAccountNumber] = useState<string|undefined>();
  const api = TrainingReducer.useApi();

  useEffect(() => {
    if (payee && accountNumber) {
      window.scraper.setCreditDetails({payee, accountNumber})
        .then(() => {
          api.setHasCreditDetails(true);
        })
    }
  }, [payee, accountNumber])

  return (
    <div style={{ display: "flex" }}>
      <Container>
        <h4>Auto-Visa Payments</h4>
        <div>Your harvester will automatically pay your visa.</div>
        <div>It uses a bill payment to do this, and needs to know the details to get it right.</div>
        <Form>
          <Dropdown
            placeholder="Credit Bank"
            fluid
            search
            selection
            options={ccPayees}
            onChange={(_, data) => setPayee(data.value as string)}
          />
          <UxInput
            intlLabel={translations.accountNumer}
            onValue={setAccountNumber}
            onValidate={value => validate(payee, value)}
          />
        </Form>
      </Container>

      <video width="320" height="240" controls>
        <source
          src="https://storage.googleapis.com/tccc-releases/Tutorials/Tutorial%20-%202%20-%20Visa%20Details.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  )
}
