
export type BackgroundTaskInfo = {
  // over-arching task ID.
  // May be assigned to multiple steps
  taskId: string,

  // A constant identifying this process
  // throughout it's lifetime
  stepId: string,

  // Posted when progress is healthy & ongoing
  // 0-100 progress
  progress?: number,
  // Any message to show, can change
  label?: string,

  // Only set once complete
  completed?: boolean
  error?: string
}

// export type ProgressInfo = {
//   step: number,
//   total: number,
//   label?: string,
//   stepPercent?: number,
// } | {
//   error: string,
// } | {
//   completed: boolean,
// }

export type BackgroundTaskCallback = (info: BackgroundTaskInfo) => void;
