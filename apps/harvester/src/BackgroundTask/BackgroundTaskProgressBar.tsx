import { Progress } from "semantic-ui-react";
import { BackgroundTaskReducer, getCompleted, getTaskGroup } from "./reducer";
import { BackgroundTaskType } from "./types";

type Props = {
  type: BackgroundTaskType
}
export const BackgroundTaskProgressBar = ({ type }: Props) => {
  const store = BackgroundTaskReducer.useData();
  const bgTask = getTaskGroup(store, type);

  if (!bgTask) {
    return null;
  }
  const completed = getCompleted(bgTask.subTasks);
  const numCompleted = Math.min(completed.length + 1, bgTask.subTasks.length);
  const message = !bgTask.completed
    ? `Running task ${numCompleted} of ${bgTask.subTasks.length}`
    : 'Complete';

  const percent = bgTask.percent ?? (bgTask.completed ? 100 : 0);
  return (
    <Progress color="green" percent={percent} active={!bgTask.completed}>
      {message}
    </Progress>
  )
}
