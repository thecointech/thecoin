import { useEffect, useState } from "react";
import { Message, Progress } from "semantic-ui-react";
import { useBackgroundTask } from "./reducer";
import { BackgroundTaskType } from "./types";
import { getRunning, getErrors, getPercent, isRunning } from "./selectors";
import type { BackgroundTaskInfo } from "./types";

type Props = {
  type: BackgroundTaskType,
  subTask?: string,
}
export const BackgroundTaskProgressBar = ({ type, subTask }: Props) => {

  const bgTask = useBackgroundTask(type);

  const [priorCompleted, setPriorCompleted] = useState<boolean | undefined>(bgTask?.completed);

  useEffect(() => {
    if (!bgTask?.completed) {
      setPriorCompleted(false);
    }
  }, [bgTask]);

  if (priorCompleted === true) {
    return null;
  }

  if (!bgTask) {
    return null;
  }
  if (subTask) {
    const task = bgTask.subTasks.find(t => t.subTaskId === subTask);
    if (!task) {
      return null;
    }
    return <BackgroundTaskProgressBarElement task={task} taskId={subTask} />
  }

  const running = getRunning(bgTask.subTasks);
  const numRunning = Math.min(running.length, bgTask.subTasks.length);
  const message = `${1 + bgTask.subTasks.length - numRunning} of ${bgTask.subTasks.length}`;
  return <BackgroundTaskProgressBarElement task={bgTask} taskId={message} />
}

const BackgroundTaskProgressBarElement = ({ task, taskId }: { task: BackgroundTaskInfo, taskId: string }) => {
  const message = isRunning(task)
  ? `Running task ${taskId}`
  : 'Complete';
  const percent = getPercent(task);
  return (
    <Progress color="green" percent={percent} active={isRunning(task)}>
      {message}
    </Progress>
  )
}

export const BackgroundTaskErrors = ({ type }: Props) => {
  const bgTask = useBackgroundTask(type);
  const errors = getErrors(bgTask);
  if (errors.length === 0) {
    return null;
  }
  return (
    <Message negative>
      <Message.Header>Errors</Message.Header>
      <Message.List>
        {errors.map((e, i) => (
          <Message.Item key={i}>{e}</Message.Item>
        ))}
      </Message.List>
    </Message>
  )
}
