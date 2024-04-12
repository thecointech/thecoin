import { Container } from 'semantic-ui-react'
import { SyncedInput } from './state/SyncedInput';

export const Step0 = () => {

  return (
    <Container>
      <h4>Congrats on join TheCoin's harvester program!</h4>
      <div>This project uses a custom AI to run the harvester program.</div>
      <div>In the next few steps we will train your AI so it can work with your existing setup.</div>
      <div>Please enter the URL of your chequing bank.</div>
      <SyncedInput bank="chequing" param="url" placeholder="https://www.YourChequingBank.com/" />
      <div>Please enter the URL of your visa bank</div>,
      <SyncedInput bank="visa" param="url" placeholder="https://www.YourVisaBank.com/" />
    </Container>
  )
}
