import { Container } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer'
import { Button } from 'semantic-ui-react'
import equal from 'fast-deep-equal';
import { defaultDays, defaultSteps, defaultTime } from '@thecointech/store-harvester';

const defaultData = {
  schedule: {
    daysToRun: defaultDays,
    timeToRun: defaultTime,
  },
  steps: defaultSteps,
}
export const Intro = () => {

  const api = ConfigReducer.useApi();
  const data = ConfigReducer.useData();

  const dataIsDefault = equal(data, defaultData);
  const reset = () => {
    api.resetToDefault();
  }
  return (
    <Container>
      <h4>Tweak how the harvester will run</h4>
      <div>Finally, lets control exactly how the harvester will behave.</div>
      <div>Here, you can set limits on what the harvester will do, or customize it to be more agressive</div>
      <div>For most people though, the defaults here will work just fine.</div>
      {!dataIsDefault && <Button onClick={reset}>Reset to Default</Button>}
    </Container>
  )
}
