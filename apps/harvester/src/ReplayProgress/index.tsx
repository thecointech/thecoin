import { useEffect } from "react";
import { ReplayProgressReducer } from "./reducer";
import { Progress } from "semantic-ui-react";

// A progress bar that only displays if there is currently a replay in progress
export const ReplayProgressBar = () => {
  const replayProgress = ReplayProgressReducer.useData();
  const api = ReplayProgressReducer.useApi();

  useEffect(() => {
    // On post, clear any existing progress
    api.setReplayProgress(undefined);
  }, []);
  if (!replayProgress.progress) {
    return null;
  }
  const percent = (replayProgress.progress.step / replayProgress.progress.total) * 100
  const active = percent < 100
  return (
    <>
      <Progress color="green" percent={percent}  active={active}>
        Step {replayProgress.progress.step} of {replayProgress.progress.total}
      </Progress>
    </>
  )
}
