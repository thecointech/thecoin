import { useState } from "react";
import { Button, Checkbox, Dimmer, Input, Loader, Segment } from "semantic-ui-react";
import type { BankData } from "./BankCard/data";
import { BackgroundTaskReducer, getTaskGroup } from "@/BackgroundTask/index";
import { BankType } from "@/Harvester/scraper";
import { log } from "@thecointech/logging";

type Props = BankData & {
  type: BankType;
  isReplaying?: boolean;
}
export const LoginDetails: React.FC<Props> = ({ icon, name, url, type, isReplaying }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  const store = BackgroundTaskReducer.useData();
  const group = getTaskGroup(store, "record");
  const isTaskRunning = (group && group.completed === undefined) || isReplaying;

  const handleSubmit = () => {
    if (isReplaying) {
      log.info('Cannot launch process because we are replaying');
      return;
    }
    // TODO: Send command to start the agent process
    log.info('Starting agent with:', url);
    // api.setAgentProgress(undefined);
    window.scraper.autoProcess({ name, url, type, username, password, visible });
  };
  return (
    <Segment>
      <Dimmer active={isTaskRunning}>
        <Loader />
      </Dimmer>
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
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username..."
      />
      <Input
        fluid
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password..."
      />
      <Checkbox onChange={() => setVisible(!visible)} checked={visible} label='Visible' /><br />
      <Button onClick={handleSubmit} loading={isTaskRunning}>Submit</Button>
  </Segment>
  )
}
