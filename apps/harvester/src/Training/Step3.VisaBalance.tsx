import { useEffect, useState } from 'react';
import { Container, Button, Icon } from 'semantic-ui-react'
import { useLearnValue } from './learnValue';
import { TrainingReducer } from './state/reducer';



const pageAction = "visaBalance";

export const VisaBalance = () => {

  const data = TrainingReducer.useData();
  const api = TrainingReducer.useApi();
  const url = data.visa.url;
  const [validating, setValidating] = useState(false);

  const [balance, learnBalance] = useLearnValue("balance", "currency");
  const [dueAmount, learnDueAmount] = useLearnValue("dueAmount", "currency");
  const [dueDate, learnDueDate] = useLearnValue("dueDate", "date");
  const [history, learnHistory, learningHistory] = useLearnValue("history", "table");

  useEffect(() => {
    if (balance && dueAmount && dueDate && history) {
      window.scraper.finishAction(pageAction);
    }
  }, [balance, dueAmount, dueDate, history])

  const initScraper = async () => {
    if (!url) alert("ERROR: Needs data")
    else {
      await window.scraper.start(pageAction, url);
      console.log("scraper started");
    }
  }
  const validate = async () => {
    setValidating(true);
    const r = await window.scraper.testAction(pageAction);
    if (r.error) alert(r.error)
    if (r.value?.balance && r.value?.dueAmount && r.value?.dueDate) {
      api.setParameter('visa', 'testPassed', true);
    }
    setValidating(false);
  }

  return (
    <Container>
      <h3>Teach your AI how to read your Visa details</h3>
      <div>Your AI will work to harvest every last penny possible, but in order to do that it needs to know what's happening on your Visa Account</div>
      <div>To teach your AI to read the right numbers, Click the button, go to the balance page, and click the highlighted balance, due date, and due balance</div>
      <div>This check ensures that your AI doesn't accidentally read the wrong value!</div>
      <div>
        <ul>
          <li><Button onClick={initScraper}>Start</Button> the webpage</li>
          <li>Navigate to your balance page</li>
          <li><Button onClick={learnBalance}>Click here</Button>, then click on the cards current balance</li>
          <li><Button onClick={learnDueAmount}>Click here</Button>, then click balance due for the current cycle</li>
          <li><Button onClick={learnDueDate}>Click here</Button>, then click date due for the current cycle</li>
          <li><Button onClick={learnHistory} loading={learningHistory} >Click here</Button>, then click anywhere on the account history</li>
        </ul>
      </div>
      <Button onClick={validate} loading={validating}>Test Learning</Button>
      {data.visa.testPassed && <Icon name='check circle' color="green" />}
      <div>Your AI read:
        <ul>
          <li>Balance: {balance} {balance && <Icon name='check circle' color="green" />}</li>
          <li>Amount Due: {dueAmount} {dueAmount && <Icon name='check circle' color="green" />}</li>
          <li>Date Due: {dueDate} {dueDate && <Icon name='check circle' color="green" />}</li>
          <li>History: {history} {history && <Icon name='check circle' color="green" />}</li>
        </ul>
      </div>
    </Container>
  )
}
