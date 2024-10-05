import { Container, Button, Icon } from 'semantic-ui-react'
import { TrainingReducer } from './state/reducer';
import { BankKey } from './state/types';

export const Warmup = () => {

  return (
    <Container>
      <h4>Time to warmup your AI's browser</h4>
      <div>This step unlocks a special kind of browser so your AI can drive it</div>
      <div>Click the "Warmup" button, then
        <ul>
          <li>log into your banks</li>
          <li>ensure you check the "Remember Me" or "Skip this step next time" so your AI can get past 2FA authentication</li>
          <li>Add your coin deposit address to your list of e-transfer recipients</li>
        </ul>
      </div>
      <div> We'll use all these things in the next steps to teach our AI how to harvest TheCoin for you</div>
      <div>
        <Warmer bank="chequing" />
        <Warmer bank="visa" />
      </div>
    </Container>
  )
}

const Warmer = ({bank}: {bank: BankKey}) => {

  const data = TrainingReducer.useData();
  const api = TrainingReducer.useApi();

  const url = data[bank].url;
  if (!url) return <div>ERROR: No url for type: {url}</div>
  const warmup = async () => {
    await window.scraper.warmup(url as string);
    api.setParameter(bank, "warm", true);
  }
  const isWarm = !!data[bank].warm;
  return (
    <>
      <div>{url}</div>
      <Button onClick={() => warmup()}>Warmup</Button>
      {isWarm && <Icon name='check circle' color="green" />}
    </>
  )
}
