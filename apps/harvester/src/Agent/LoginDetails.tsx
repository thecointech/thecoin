import { useState } from "react";
import { Button, Dimmer, Input, Loader, Segment } from "semantic-ui-react";
import type { BankData } from "./BankCard/data";
import type { ActionTypes } from "@/Harvester/scraper";
import { BackgroundTaskReducer } from "@/BackgroundTask/index";

type Props = BankData & {
  actionName: ActionTypes;
}
export const LoginDetails: React.FC<Props> = ({ icon, name, url, actionName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const r = BackgroundTaskReducer.useData();
  const task = r.tasks[actionName];
  const isTaskRunning = task && task.completed === undefined;

  const handleSubmit = () => {
    // TODO: Send command to start the agent process
    console.log('Starting agent with:', url);
    // api.setAgentProgress(undefined);
    window.scraper.autoProcess({ actionName, url, username, password });
  };
  return (
    <Segment>
      <Dimmer active={isTaskRunning}>
        <Loader />
      </Dimmer>
      <p style={{ display: 'flex', alignItems: 'center' }}>
        <img style={{ width: '75px', height: '75px' }} src={icon} alt={name} />
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
      <Button onClick={handleSubmit}>Submit</Button>
  </Segment>
  )
}
