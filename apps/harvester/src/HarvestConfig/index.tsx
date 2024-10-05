import { Link, useLocation, useHistory } from 'react-router-dom'
import { Button, Step } from 'semantic-ui-react';
import { ConfigRouter, routes } from './routes'
import styles from './index.module.less';
import { ConfigReducer } from './state/reducer';

export const HarvestConfig = () => {

  ConfigReducer.useStore();
  const location = useLocation();
  const navigate = useHistory();
  const curr = location.pathname;
  const m = curr.match(/\/step([0-9])$/)

  // Disable "next" button if we're on the last step
  const buttonDisplay = m?.[1] == "6"
    ? "none"
    : undefined;

  return (
    <div>
      <Step.Group ordered>
        <ConfigStep
          title="Intro"
          description="Last step"
          // completed={true}
          to="/config"
          pathname={location.pathname} />
        {
          routes.map((r, i) => (
            <ConfigStep
              key={i}
              title={r.title}
              description={r.description}
              to={`/config/step${i}`}
              pathname={location.pathname} />
          ))
        }
      </Step.Group>
      <div className={styles.container}>
        <ConfigRouter />
        <Button style={{display: buttonDisplay}} onClick={() => {
          // Page is last number
          if (m) {
            navigate.push("/config/step" + (parseInt(m[1]) + 1));
          } else {
            navigate.push("/config/step0");
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
