import { Container, Header } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer'
import { defaultDays, defaultSteps, defaultTime } from '@thecointech/store-harvester';
import { ActionButton } from '@/ContentSection/Action';
import { useLocation } from 'react-router-dom';
import { groupKey, routes } from './routes';

const defaultData = {
  schedule: {
    daysToRun: defaultDays,
    timeToRun: defaultTime,
  },
  steps: defaultSteps,
}
export const Intro = () => {

  const location = useLocation();

  const api = ConfigReducer.useApi();

  const setUseDefaults = () => {
    api.resetToDefault();
    location.pathname = `/${groupKey}/${routes.length - 1}`;
  }
  return (
    <Container>
      <Header size="small">Tweak how the harvester will run</Header>
      <div>Finally, lets control exactly how the harvester will behave.</div>
      <div>Here, you can set limits on what the harvester will do, or customize it to be more agressive</div>
      <div>For most people though, the defaults here will work just fine.</div>
      <br />
      <ActionButton onClick={setUseDefaults}>Use Defaults</ActionButton>
    </Container>
  )
}
