import React, { useState } from 'react';
import { Progress, Button, Accordion, Icon, StrictAccordionTitleProps } from 'semantic-ui-react';
import { BackgroundTaskReducer, getTaskGroup, type BackgroundTaskInfo } from '@/BackgroundTask';
import { BankData} from './BankCard/data';
import { QuestionResponse } from './QuestionResponse';
import { LoginDetails } from './LoginDetails';
import { BankSelect } from './BankSelect';
import { ActionType } from '@/Harvester/scraper/types';
import { BackgroundTaskProgressBar } from '@/BackgroundTask/BackgroundTaskProgressBar';


export const AgentPage: React.FC = () => {
  const [chequingBank, setChequingBank] = useState<BankData>();
  const [creditBank, setCreditBank] = useState<BankData>();
  const [activeIndex, setActiveIndex] = useState(0);

  const tasks = BackgroundTaskReducer.useData();
  // const initTask = getTaskGroup(tasks, 'initialize');
  const recordTask = getTaskGroup(tasks, 'record');
  const replayTask = getTaskGroup(tasks, 'replay');

  const isRecording = (recordTask && recordTask.completed === undefined) ?? false;
  const isReplaying = (replayTask && replayTask.completed === undefined) ?? false;

  const differentBanks = chequingBank && creditBank && chequingBank.url !== creditBank.url;
  const qaIndex = differentBanks ? 4 : 3;

  const handleSetChequingBank = (bank: BankData) => {
    setChequingBank(bank);
    if (bank.url) {
      setActiveIndex(i => i + 1);
    }
  };

  const handleSetCreditBank = (bank: BankData) => {
    setCreditBank(bank);
    if(bank.url) {
      setActiveIndex(i => i + 1);
    }
  };

  const setQuestionActive = () => {
    setActiveIndex(qaIndex);
  }

  const handleAccordionClick = (_e: React.MouseEvent, titleProps: StrictAccordionTitleProps) => {
    if (isRecording) {
      return;
    }
    const index = Number(titleProps.index ?? 0);
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  return (
    <div className="agent-page" style={{ padding: '2rem' }}>
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
            <LoginDetails {...chequingBank!} type={differentBanks ? "chequing" : "both"}  isReplaying={isReplaying} />
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
                  <LoginDetails {...creditBank!} type="credit" isReplaying={isReplaying} />
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
            <QuestionResponse setQuestionActive={setQuestionActive} isRecording={isRecording} />
          </Accordion.Content>
        </Accordion>
      </div>

      <BackgroundTaskProgressBar type="record" />
      {/* <AgentProgressBar task={recordTask} /> */}
      <AgentCompleted task={recordTask} type="chqBalance" />
      <AgentCompleted task={recordTask} type="chqETransfer" />
      <AgentCompleted task={recordTask} type="visaBalance" />
      <BackgroundTaskProgressBar type="replay" />
      {/* <AgentProgressBar task={validateTask} /> */}
    </div>
  );
};

const getBarColor = (task: BackgroundTaskInfo) => task.completed !== true ? 'blue' : 'green';

// export const AgentInitProgressBar = ({tasks}: {tasks: BackgroundTaskInfo[]}) => {
//   if (tasks.filter((t) => !t.completed).length === 0) return null;
//   return (
//     <>{
//       tasks.map((task) => (
//         <Progress
//           key={task.item}
//           percent={task.percent ?? 0}
//           active={!task.completed}
//           progress
//           indicating
//           success={task.completed === true}
//           error={task.error !== undefined}
//           color={getBarColor(task)}
//           label={task.item}
//       />
//     ))
//     }
//     </>
//   )
// }

export const AgentProgressBar = ({task}: {task?: BackgroundTaskInfo}) => {
  if (!task) return null;
  return (
    <Progress
      percent={Math.round(task.percent ?? 0)}
      active={!task.completed}
      progress
      success={task.completed === true}
      error={task.error !== undefined}
      color={getBarColor(task)}
      label={task.description}
    />
  )
}

type AgentCompletedProps = {
  task?: BackgroundTaskInfo
  type: ActionType
}
export const AgentCompleted = ({task, type}: AgentCompletedProps) => {

  const [result, setResult] = useState<Record<string, string> | undefined>(undefined);
  async function validate(): Promise<void> {
    // TODO: This should be a long-running operation that returns
    // results in BackgroundTaskInfo
    const r = await window.scraper.validateAction(type, {});
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
