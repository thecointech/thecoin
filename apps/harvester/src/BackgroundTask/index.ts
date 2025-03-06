import { BackgroundTaskInfo } from './types';

export type * from './types';
export * from './reducer';

export const getError = (task: BackgroundTaskInfo) => ("error" in task ? task.error : undefined);
export const getProgress = (task: BackgroundTaskInfo) => ("progress" in task ? task.progress : "completed" in task ? 100 : 0);
