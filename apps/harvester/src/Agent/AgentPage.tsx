import React, { useState } from 'react';
import { Progress, Button, Accordion, Icon, StrictAccordionTitleProps } from 'semantic-ui-react';
import { BackgroundTaskReducer, type BackgroundTaskInfo } from '@/BackgroundTask';
import { BankData} from './BankCard/data';
import { QuestionResponse } from './QuestionResponse';
import { LoginDetails } from './LoginDetails';
import { BankSelect } from './BankSelect';
import { ActionTypes } from '@/Harvester/scraper/types';


export const AgentPage: React.FC = () => {
  const [chequingBank, setChequingBank] = useState<BankData>();
  const [creditBank, setCreditBank] = useState<BankData>();
  const [activeIndex, setActiveIndex] = useState(0);

  const r = BackgroundTaskReducer.useData();

  const task = r.tasks[chequingBank?.name ?? ''];
  const initTasks = Object.values(r.tasks).filter((t) => t.taskId === "initAgent");
  const replayTask = Object.values(r.tasks).find((t) => t.taskId === "replay");

  const isTaskRunning = task && task.completed === undefined;

  const differentBanks = chequingBank && creditBank && chequingBank.name !== creditBank.name;
  const qaIndex = differentBanks ? 4 : 3;

  const handleSetChequingBank = (bank: BankData) => {
    setChequingBank(bank);
    setActiveIndex(i => i + 1);
  };

  const handleSetCreditBank = (bank: BankData) => {
    setCreditBank(bank);
    setActiveIndex(i => i + 1);
  };

  const setQuestionActive = () => {
    setActiveIndex(qaIndex);
  }

  const initAgent = async () => {
    if (isTaskRunning) {
      return;
    }
    await window.scraper.init();
  }

  const handleAccordionClick = (_e: React.MouseEvent, titleProps: StrictAccordionTitleProps) => {
    if (isTaskRunning) {
      return;
    }
    const index = Number(titleProps.index ?? 0);
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  return (
    <div className="agent-page" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '2rem' }}>
        <Button onClick={initAgent} disabled={!!task}>Initialize</Button>
        <AgentInitProgressBar tasks={initTasks} />
      </div>

      <div style={{ marginBottom: '2rem' }}>

        <Accordion fluid styled>
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={handleAccordionClick}
          >
            <Icon name="dropdown" />
            {getTitle(chequingBank, 'Chequing')}
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            <BankSelect onSelectBank={handleSetChequingBank} type="chequing" />
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={handleAccordionClick}
          >
            <Icon name="dropdown" />
            {getTitle(creditBank, 'Credit')}
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <BankSelect onSelectBank={handleSetCreditBank} type="credit" />
          </Accordion.Content>

          <Accordion.Title
            disabled={chequingBank === undefined || creditBank === undefined}
            active={activeIndex === 2}
            index={2}
            onClick={handleAccordionClick}
          >
          <Icon name="dropdown" />
            Login Details: {chequingBank?.name}
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <LoginDetails {...chequingBank!} type={differentBanks ? "chequing" : "both"} />
          </Accordion.Content>
          {
            (differentBanks) && (
              <>
                <Accordion.Title
                  disabled={creditBank === undefined}
                  active={activeIndex === 3}
                  index={3}
                  onClick={handleAccordionClick}
                >
                <Icon name="dropdown" />
                  Login Details: {creditBank?.name}
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 3}>
                  <LoginDetails {...creditBank!} type="credit" />
                </Accordion.Content>
              </>
            )
          }
          <Accordion.Title
            active={activeIndex === qaIndex}
            index={qaIndex}
            onClick={handleAccordionClick}
          >
          <Icon name="dropdown" />
            Additional Info
          </Accordion.Title>
          <Accordion.Content active={activeIndex === qaIndex}>
            <QuestionResponse setQuestionActive={setQuestionActive} isTaskRunning={isTaskRunning} />
          </Accordion.Content>
        </Accordion>
      </div>

      <AgentProgressBar task={task} />
      <AgentCompleted task={task} type="chqBalance" />
      <AgentCompleted task={task} type="chqETransfer" />
      <AgentCompleted task={task} type="visaBalance" />
      <AgentProgressBar task={replayTask} />
    </div>
  );
};

const getBarColor = (task: BackgroundTaskInfo) => task.completed !== true ? 'blue' : 'green';

export const AgentInitProgressBar = ({tasks}: {tasks: BackgroundTaskInfo[]}) => {
  if (tasks.filter((t) => !t.completed).length === 0) return null;
  return (
    <>{
      tasks.map((task) => (
        <Progress
          key={task.stepId}
          percent={task.progress ?? 0}
          active={!task.completed}
          progress
          indicating
          success={task.completed === true}
          error={task.error !== undefined}
          color={getBarColor(task)}
          label={task.label}
      />
    ))
    }
    </>
  )
}

export const AgentProgressBar = ({task}: {task?: BackgroundTaskInfo}) => {
  if (!task) return null;
  return (
    <Progress
      percent={Math.round(task.progress ?? 0)}
      active={!task.completed}
      progress
      indicating
      success={task.completed === true}
      error={task.error !== undefined}
      color={getBarColor(task)}
      label={task.label}
    />
  )
}

type AgentCompletedProps = {
  task?: BackgroundTaskInfo
  type: ActionTypes
}
export const AgentCompleted = ({task, type}: AgentCompletedProps) => {

  const [result, setResult] = useState<Record<string, string> | undefined>(undefined);
  async function validate(): Promise<void> {
    const r = await window.scraper.testAction(type);
    if (r.error) alert(r.error);
    console.log('Validation result:', r.value);
    setResult(r.value);
  }

  if (task?.error) {
    return (
      <div style={{ color: 'red' }}>{task.error}</div>
    )
  }
  // else if (task?.completed) {
    return (
      <>
      <div>
        Agent completed <Button onClick={validate}>Validate {type}</Button>
      </div>
      <div color="darkgreen">
        {result && Object.entries(result).map(([k, v]) => <div key={k}>{k}: {v}</div>)}
      </div>
      </>
    )
  // }
  // return null;
}

const getTitle = (bank: BankData | undefined, type: 'Chequing' | 'Credit') =>
  bank?.name
    ? `${type}: ${bank.name}`
    : `Select ${type} Bank`;

export default AgentPage;
