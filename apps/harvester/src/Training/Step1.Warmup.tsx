import { useState } from 'react';
import { Container, Button, Icon, Input } from 'semantic-ui-react'
import { getData, Key, SyncedInput } from './data';

export const Warmup = () => {

  return (
    <Container>
      <div>Time to warmup your AI's browser</div>
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
        <Warmer type={Key.chequing} bal={Key.chqInitBalance} />
        <Warmer type={Key.visa } bal={Key.vsaInitBalance} />
      </div>
    </Container>
  )
}

const Warmer = ({type, bal}: {type: Key, bal: Key}) => {

  const [isWarm, setIsWarm] = useState(!!getData(bal));

  const url = getData(type);
  if (!url) return <div>ERROR: No url for type: {type}</div>
  const warmup = async () => {
    await window.scraper.warmup(url);
    setIsWarm(true);
  }
  return (
    <>
      <div>{url}</div>
      <Button onClick={() => warmup()}>Warmup</Button>
      {isWarm && <Icon name='check circle' color="green" />}
    </>
  )
}