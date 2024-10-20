import { Container } from 'semantic-ui-react'
import { SyncedInput } from './state/SyncedInput';

export const Step0 = () => {

  return (
    <div style = {{display: "flex" }}>
      <Container>
        <h4>Congrats on joining TheCoin's harvester program!</h4>
        <div>This project uses a custom AI to run the harvester program.</div>
        <div>In the next few steps we will train your AI so it can work with your existing setup.</div>
        <div>Please enter the URL of your chequing bank.</div>
        <SyncedInput bank="chequing" param="url" placeholder="https://www.YourChequingBank.com/" />
        <div>Please enter the URL of your visa bank</div>,
        <SyncedInput bank="visa" param="url" placeholder="https://www.YourVisaBank.com/" />
      </Container>

      <video width="320" height="240" controls>
        <source
          src="https://storage.googleapis.com/tccc-releases/Tutorials/Tutorial%20-%201%20-%20Enter%20URLs.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  )
}
