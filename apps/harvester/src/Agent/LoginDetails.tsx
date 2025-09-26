import { useState } from "react";
import { Button, Dimmer, Input, Loader } from "semantic-ui-react";
import type { BankData } from "./BankCard/data";
import { isRunning, useBackgroundTask } from "@/BackgroundTask/index";
import { BankType } from "@/Harvester/scraper";
import { log } from "@thecointech/logging";
import styles from './LoginDetails.module.less';

type Props = BankData & {
  type: BankType;
  both?: boolean;
}
export const LoginDetails: React.FC<Props> = ({ icon, name, url, type, both }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const group = useBackgroundTask("record");
  const replay = useBackgroundTask("replay");
  const isTaskRunning = isRunning(group) || isRunning(replay);

  const handleSubmit = () => {
    if (isTaskRunning) {
      log.info('Cannot launch process because we are recording or replaying');
      return;
    }
    // TODO: Send command to start the agent process
    log.info('Starting agent with:', url);
    const storedType = both ? "both" : type;
    window.scraper.autoProcess({ type: storedType, config: { name, url, username, password }, visible: false });
  };
  return (
    <div className={styles.loginContainer}>
      <Dimmer active={isTaskRunning}>
        <Loader />
      </Dimmer>
      <div className={styles.userForm}>
        <p style={{ display: 'flex', alignItems: 'center' }}>
          {
            icon && (
              <img style={{ width: '75px', height: '75px' }} src={icon} alt={name} />
            )
          }
          Enter your login details:
        </p>
        <Input
          fluid
          value={username}
          onChange={(_, data) => setUsername(String(data.value ?? ''))}
          placeholder="Enter your username..."
        />
        <Input
          fluid
          type='password'
          value={password}
          onChange={(_, data) => setPassword(String(data.value ?? ''))}
          placeholder="Enter your password..."
        />
        <Button onClick={handleSubmit} loading={isTaskRunning}>Submit</Button>
      </div>
    </div>
  )
}
