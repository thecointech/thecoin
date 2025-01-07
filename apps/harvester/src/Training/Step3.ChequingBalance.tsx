import { useEffect, useState } from 'react';
import { Container, Button, Icon } from 'semantic-ui-react'
import { TrainingReducer } from './state/reducer';
import { useLearnValue } from './learnValue';
import { ReplayProgressBar } from '../ReplayProgress';

const pageAction = "chqBalance";

export const ChequingBalance = () => {

  const data = TrainingReducer.useData();
  const api = TrainingReducer.useApi();
  // const [read,setRead] = useState('');
  const [validating, setValidating] = useState(false);

  const [balance, learnBalance] = useLearnValue("balance", "currency");

  const url = data.chequing.url;

  useEffect(() => {
    if (balance) {
      window.scraper.finishAction();
    }
  }, [balance])

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
    if (r.value?.balance) {
      api.setParameter("chequing", "testPassed", true);
    }
    setValidating(false);
  }
  return (
    <div style={{ display: "flex" }}>

      <Container>
        <h4>Teach your AI how to read the balance correctly</h4>
        <div>In order to harvest TheCoin effectively, your AI needs to be able to read the balance of your Chequing Account</div>
        <div>Follow these 3 steps to teach your AI how to read the balance:</div>
        <ul>
          <li><Button onClick={initScraper}>Start</Button> the webpage</li>
          <li>Navigate to your balance page</li>
          <li><Button onClick={learnBalance}>Click here</Button>, then click on the balance you want your AI to read</li>
        </ul>
        <div>Finally, check the value below to ensure your AI hasn't accidentally read the wrong value!</div>
        <Button onClick={validate} loading={validating}>Test Learning</Button>
        <ReplayProgressBar />
        <div>Your AI read: {balance}
          {data.chequing.testPassed && <Icon name='check circle' color="green" />}
        </div>
      </Container>
      <video width="320" height="240" controls>
        <source
          src="https://storage.googleapis.com/tccc-releases/Tutorials/Tutorial%20-%204%20-%20Learn%20Cheque%20Balance.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  )
}
