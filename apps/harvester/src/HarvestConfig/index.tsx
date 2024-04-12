import { Link, useLocation, useHistory } from 'react-router-dom'
import { Button, Step } from 'semantic-ui-react';
import { ConfigRouter } from './routes'
import styles from './index.module.less';
import { ConfigReducer } from './state/reducer';

export const HarvestConfig = () => {

  ConfigReducer.useStore();
  const location = useLocation();
  const navigate = useHistory();
  const curr = location.pathname;
  const m = curr.match(/\/step([0-9])$/)

  // Disable "next" button if we're on the last step
  const buttonDisplay = m?.[1] == "5"
    ? "none"
    : undefined;

  return (
    <div>
      <Step.Group ordered>
        <ConfigStep
          title="Intro"
          description="Last step"
          // completed={true}
          to="/config/step0"
          pathname={location.pathname} />
        <ConfigStep
          title="Schedule"
          description="When to run"
          // completed={isLoggedIn}
          to="/config/step1"
          pathname={location.pathname} />
        <ConfigStep
          title="Transfer Amount"
          description="Tweak how much is transferred"
          // completed={hasPlugins}
          to="/config/step2"
          pathname={location.pathname} />
        <ConfigStep
          title="Top Up"
          description="Super-savings"
          // completed={hasPlugins}
          to="/config/step3"
          pathname={location.pathname} />
        <ConfigStep
          title="Limits"
          description="Sdlfkjsdf"
          // completed={hasPlugins}
          to="/config/step4"
          pathname={location.pathname} />
        <ConfigStep
          title="Complete"
          description="Sdlfkjsdf"
          // completed={hasPlugins}
          to="/config/step5"
          pathname={location.pathname} />
        { process.env.CONFIG_NAME=="prodtest"
          ? <ConfigStep
              title="Override Balance"
              description="PRODTEST ONLY"
              // completed={hasPlugins}
              to="/config/step6"
              pathname={location.pathname} />
          : undefined
      }
      </Step.Group>
      <div className={styles.container}>
        <ConfigRouter />
        <Button style={{display: buttonDisplay}} onClick={() => {
          // Page is last number
          if (m) {
            navigate.push("/config/step" + (parseInt(m[1]) + 1));
          } else {
            navigate.push("/config/step1");
          }
        }}>Next</Button>
      </div>
    </div>
  )
}

type ConfigStepProps = {
  title: string
  description: string
  // completed: boolean
  to: string
  pathname: string
  // disabled?: boolean
}
const ConfigStep = (p: ConfigStepProps) => (
  <Step as={Link} to={p.to} active={p.pathname == p.to}>
    <Step.Content>
      <Step.Title>{p.title}</Step.Title>
      <Step.Description>{p.description}</Step.Description>
    </Step.Content>
  </Step>
)
