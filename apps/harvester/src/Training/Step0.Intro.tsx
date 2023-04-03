import { Container } from 'semantic-ui-react'
import { Key, SyncedInput } from './data'

export const Step0 = () => {
  return (
    <Container>
      <div>Congrats on join TheCoin's harvester program!</div>
      <div>This project uses a custom AI to run the harvester program.</div>
      <div>In the next few steps we will train your AI so it can work with your existing setup.</div>
      <div>Please enter the URL of your chequing bank.</div>
      <SyncedInput type={Key.chequing} placeholder="https://www.YourChequingBank.com/" />
      <div>Please enter the URL of your visa bank</div>,
      <SyncedInput type={Key.visa} placeholder="https://www.YourVisaBank.com/" />
    </Container>
  )
}