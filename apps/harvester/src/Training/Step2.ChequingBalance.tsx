import { useState } from 'react';
import { Container, Button, Icon } from 'semantic-ui-react'
import { TrainingReducer } from './state/reducer';

const pageAction = "chqBalance";

export const ChequingBalance = () => {

  const data = TrainingReducer.useData();
  const api = TrainingReducer.useApi();
  const [read,setRead] = useState('');
  const [validating, setValidating] = useState(false);

  const url = data.chequing.url;
  const initScraper = async () => {
    if (!url) alert("ERROR: Needs data")
    else {
      await window.scraper.start(pageAction, url);
      console.log("scraper started");
    }
  }
  const teachBalance = async () => {
    const r = await window.scraper.learnValue('balance', "currency");
    if (r.error) alert(r.error);
    if (r.value) {
      console.log("The AI read: " + r.value);
      setRead(r.value.text ?? '');
      api.setParameter("chequing", "initBalance", r.value.text);

      // Close the browser if needed
      await window.scraper.finishAction(pageAction);
    }
  }
  const validate = async () => {
    setValidating(true);
    const r = await window.scraper.testAction(pageAction);
    if (r.error) alert(r.error)
    if (r.value?.balance) {
      if (!read) {
        setRead(r.value.balance);
        api.setParameter("chequing", "testPassed", true);
      } else {
        // The value will have gone through a currency conversion,
        // so strip out any spaces to ensure it is equal to the read value
        // const same = r.value.balance == read.replace(/\s/g, '');
        // TODO: Do we care?
        api.setParameter("chequing", "testPassed", true);
      }
    }
    setValidating(false);
  }
  return (
    <Container>
      <h4>Teach your AI how to read the balance correctly</h4>
      <div>In order to harvest TheCoin effectively, your AI needs to be able to read the balance of your Chequing Account</div>
      <div>Follow these 3 steps to teach your AI how to read the balance:</div>
      <ul>
        <li><Button onClick={initScraper}>Start</Button> the webpage</li>
        <li>Navigate to your balance page</li>
        <li><Button onClick={teachBalance}>Click here</Button>, then click on the balance you want your AI to read</li>
      </ul>
      <div>Finally, check the value below to ensure your AI hasn't accidentally read the wrong value!</div>
      <Button onClick={validate} loading={validating}>Test Learning</Button>
      <div>Your AI read: {read}
        {data.chequing.testPassed && <Icon name='check circle' color="green" />}
      </div>
    </Container>
  )
}
