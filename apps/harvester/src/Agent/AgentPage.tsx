import React, { useState } from 'react';
import { Progress, Input, Button, Accordion, Icon, StrictAccordionTitleProps } from 'semantic-ui-react';
import { BackgroundTaskReducer, type BackgroundTaskInfo } from '@/BackgroundTask';
import { BankData, banks } from './BankCard/data';
import { BankCard } from './BankCard/BankCard';
import { QuestionResponse } from './QuestionResponse';
import { LoginDetails } from './LoginDetails';

const taskId = "chqBalance";

export const AgentPage: React.FC = () => {
  const [chequingBank, setChequingBank] = useState<BankData>();
  const [activeIndex, setActiveIndex] = useState(0);

  const r = BackgroundTaskReducer.useData();

  const task = r.tasks[taskId];
  const initTasks = Object.values(r.tasks).filter((t) => t.taskId === "initAgent");
  const replayTask = Object.values(r.tasks).find((t) => t.taskId === "replay");

  const bankTitle = chequingBank?.name ?? 'Select Chequing Bank';

  const isTaskRunning = task && task.completed === undefined;

  const handleSetBank = (bank: BankData) => {
    setChequingBank(bank);
    setActiveIndex(i => i + 1);
  };

  const setQuestionActive = () => {
    setActiveIndex(2);
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
            {bankTitle}
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            <p>Select your chequing bank provider:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {
                banks.map((bank, i) => (
                  <BankCard key={i} {...bank} isSelected={bank.name === chequingBank?.name} onClick={handleSetBank} />
                ))
              }
              </div>
            <Input
              visible={chequingBank === undefined}
              disabled={chequingBank?.url !== undefined}
              fluid
              value={chequingBank?.url ?? ""}
              // onChange={(e) => setUrl(e.target.value)}
              placeholder="URL to process"
              style={{ marginBottom: '1rem' }}
            />
          </Accordion.Content>

          <Accordion.Title
            disabled={chequingBank === undefined}
            active={activeIndex === 1}
            index={1}
            onClick={handleAccordionClick}
          >
            <Icon name="dropdown" />
            Login Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <LoginDetails {...chequingBank!} actionName={taskId} />
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={handleAccordionClick}
          >
          <Icon name="dropdown" />
            Two Factor Authentication
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <QuestionResponse setQuestionActive={setQuestionActive} />
          </Accordion.Content>
        </Accordion>
      </div>

      <AgentProgressBar task={task} />
      <AgentCompleted task={task} />
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

export const AgentCompleted = ({task}: {task?: BackgroundTaskInfo}) => {

  const [result, setResult] = useState<Record<string, string> | undefined>(undefined);
  async function validate(): Promise<void> {
    const r = await window.scraper.testAction(taskId);
    if (r.error) alert(r.error);
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
        Agent completed <Button onClick={validate}>Validate</Button>
      </div>
      <div color="darkgreen">
        {result && Object.entries(result).map(([k, v]) => <div key={k}>{k}: {v}</div>)}
      </div>
      </>
    )
  // }
  // return null;
}

export default AgentPage;
