import { useState } from 'react';
import { Container, Button, Icon, Input } from 'semantic-ui-react'
import { useLearnValue } from './learnValue';
import { TrainingReducer } from './state/reducer';

const pageAction = "chqETransfer";

export const SendETransfer = () => {

  const data = TrainingReducer.useData();
  const api = TrainingReducer.useApi();
  const [validating, setValidating] = useState(false);

  const [amount, setAmount] = useState(5.23);
  const [confirmation, learnConfirmation] = useLearnValue("confirm", "text");

  const url = data.chequing.url;

  const initScraper = async () => {
    if (!url) alert("ERROR: Needs data")
    else {
      await window.scraper.start(pageAction, url, ["amount"]);
      console.log("scraper started");
    }
  }
  const enterSendAmount = async () => {
    await window.scraper.setDynamicInput("amount", amount.toString());
  }
  const validate = async () => {
    // Don't do e-transfers in dev mode
    if (process.env.NODE_ENV == "development") {
      api.setParameter("chequing", "eTransferPassed", true);
      return;
    }
    setValidating(true);
    const r = await window.scraper.testAction(pageAction, {
      amount: amount.toString(),
    });
    if (r.error) alert(r.error)
    if (r.value?.confirm) {
      if (r.value.confirm == confirmation) {
        alert("Warning: We seem to have a duplicate confirm code: " + r.value.confirm);
      }
      else {
        alert("Your test transfer was successful!, confirm: " + r.value.confirm);
      }
      api.setParameter("chequing", "eTransferPassed", true);
    }
    setValidating(false);
  }


  return (
    <Container>
      <h3>Teach your AI how transfer to TheCoin</h3>
      <div>In this last step, we teach your AI how to transfer money to your Coin account</div>
      <div>Your AI needs to do this so it can invest the spending from your visa card</div>
      <div>Train your AI by sending an eTransfer of the amount specified below to your Coin Account</div>
      <div>Remember, this is a deposit, not a purchase - you can withdraw it whenever you like</div>
      <div>
        <ul>
          <li><Button onClick={initScraper}>Start</Button> the webpage</li>
          <li>Navigate to your Send e-Transfer page</li>
          <li><Input value={amount} onChange={(_, {value}) => setAmount(parseFloat(value))} /> an amount here to send</li>
          <li><Button onClick={enterSendAmount}>Click here</Button>, then select where in the page to input the sending amount</li>
          <li>Send the e-transfer</li>
          <li><Button onClick={learnConfirmation}>Click here</Button>, then click on the e-Transfer confirmation code</li>
        </ul>
      </div>
      <Button onClick={validate} loading={validating}>Test Learning</Button>
      {data.chequing.eTransferPassed && <Icon name='check circle' color="green" />}
      <div>Your AI read:
        <ul>
          <li>Amount Sent: {data.chequing.eTransferPassed && <Icon name='check circle' color="green" />}</li>
          <li>Confirmation: {confirmation} {confirmation && <Icon name='check circle' color="green" />}</li>
        </ul>
      </div>
    </Container>
  )
}

