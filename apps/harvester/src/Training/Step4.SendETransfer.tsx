import { useState } from 'react';
import { Container, Button, Icon, Input } from 'semantic-ui-react'
import { getData, Key } from './data';
import { useLearnValue } from './learnValue';

const pageAction = "chqETransfer";

export const SendETransfer = () => {
  const url = getData(Key.chequing);
  const [valid, setValid] = useState(false);
  const [amount, setAmount] = useState(5.23);
  const [confirmation, learnConfirmation] = useLearnValue("confirm", "text");

  const initScraper = async () => {
    if (!url) alert("ERROR: Needs data")
    else {
      const dynamicValues = {
        amount: amount.toString(),
      }
      console.log("sending: " + JSON.stringify(dynamicValues));
      await window.scraper.start(pageAction, url, dynamicValues);
      console.log("scraper started");
    }
  }
  const validate = async () => {
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
      setValid(true);
    }
  }
  return (
    <Container>
      <h3>Teach your AI how transfer to TheCoin</h3>
      <div>In this last step, we teach your AI how to transfer money to your Coin account</div>
      <div>Your AI needs to do this so it can invest the spending on your visa card</div>
      <div>Train your AI by sending an eTransfer of the amount specified below to your Coin Account</div>
      <div>Remember, this is a deposit, not a purchase - you can withdraw it whenever you like</div>
      <div>
        <ul>
          <li><Button onClick={initScraper}>Start</Button> the webpage</li>
          <li>Navigate to your Send e-Transfer page</li>
          <li><Input value={amount} onChange={(_, {value}) => setAmount(parseFloat(value))} />Send an e-Transfer of <b>exactly</b> this amount</li>
          <li><Button onClick={learnConfirmation}>Click here</Button>, then click on the e-Transfer confirmation code</li>
        </ul>
      </div>
      <Button onClick={validate}>Test Learning</Button>
      {valid && <Icon name='check circle' color="green" />}
      <div>Your AI read:
        <ul>
          <li>Amount Sent: {valid && <Icon name='check circle' color="green" />}</li>
          <li>Confirmation: {confirmation} {confirmation && <Icon name='check circle' color="green" />}</li>
        </ul>
      </div>
    </Container>
  )
}