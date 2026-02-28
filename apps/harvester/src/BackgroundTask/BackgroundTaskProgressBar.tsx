//@ts-ignore
import React from 'react';
import { useEffect, useState } from "react";
import { Message, Progress } from "semantic-ui-react";
import { useBackgroundTask } from "./reducer";
import { BackgroundTaskType } from "./types";
import { getRunning, getErrors, getPercent, isRunning } from "./selectors";
import type { BackgroundTaskInfo } from "./types";
import styles from "./BackgroundTaskProgressBar.module.less";

type Props = {
  type: BackgroundTaskType,
  subTask?: string,
  closeOnComplete?: boolean,
  alwaysDisplay?: boolean,
}
export const BackgroundTaskProgressBar = ({ type, subTask, closeOnComplete, alwaysDisplay }: Props) => {

  const bgTask = useBackgroundTask(type);

  const [priorCompleted, setPriorCompleted] = useState<boolean | undefined>(bgTask?.completed);

  useEffect(() => {
    if (!bgTask?.completed) {
      setPriorCompleted(false);
    }
  }, [bgTask?.completed]);

  if (!alwaysDisplay && priorCompleted === true) {
    return null;
  }

  if (!bgTask) {
    return null;
  }
  if (bgTask.completed && closeOnComplete) {
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
  const message = bgTask.subTasks.length
    ? `${1 + bgTask.subTasks.length - numRunning} of ${bgTask.subTasks.length}`
    : bgTask.description ?? "";
  return <BackgroundTaskProgressBarElement task={bgTask} taskId={message} />
}

const BackgroundTaskProgressBarElement = ({ task, taskId }: { task: BackgroundTaskInfo, taskId: string }) => {
  const running = isRunning(task);
  const errors = getErrors(task);
  const message = running
    ? `Running task ${taskId}`
    : errors.length > 0 ? `Failed` : `Complete`;
  const color = errors.length > 0 ? "yellow" : running ? "blue" : "green";
  const percent = Math.round(getPercent(task));
  return (
    <Progress color={color} percent={percent} active={isRunning(task)} progress>
      <span className={styles.taskName}>
        {task.type}
      </span>
      &nbsp;-&nbsp;
      <span className={styles.taskMessage}>
        {message}
      </span>
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
