export type BackgroundTaskType = "initialize" | "record" | "validate" | "replay";

// Base progress information shared by all task types
export type TaskProgress = {
  // Posted when progress is healthy & ongoing (0-100)
  percent?: number,
  // Only set once complete
  completed?: boolean,
  // Set if there was an error
  error?: string,
}

// A group task that can contain subtasks
export type GroupTask = TaskProgress & {
  // Unique identifier for this specific task group
  id: string,
  // The type of task being performed
  type: BackgroundTaskType,
  // Optional description of the overall task
  description?: string,
}

export type SubTaskProgress = TaskProgress & {
  // Constant ID of the subtask
  subTaskId: string,
  // Description of the task
  description?: string,
  // Optional additional details specific to this task
  details?: Record<string, unknown>,
}

// A leaf task that represents a single operation
export type SubTask = SubTaskProgress & {
  // The ID of the group task this subtask is a part of
  parentId: string,
  // The type of task being performed.  Duplicated from parent,
  // but because parent can be lost on app reload it needs to
  // be included here.
  type: BackgroundTaskType,
};

// Type guard to check if a task has subtasks
export function isSubTask(task: GroupTask|SubTask): task is SubTask {
  return 'parentId' in task;
}


export type BackgroundTaskInfo = GroupTask | SubTask
// export type BackgroundTaskInfoInst = Omit<BackgroundTaskInfo, "id">;

export type BackgroundTaskCallback = (info: BackgroundTaskInfo) => void;
// export type BackgroundTaskCallbackInst = (info: BackgroundTaskInfoInst) => void;


// export type TaskId<TaskType = BackgroundTaskType> = {

//   // Unique identifier of the task
//   id: string,

//   // Identities the job the task is associated with
//   type: TaskType,
// }

// export type TaskInfo<Details = void> = {
//   // eg filename, stage name, etc or undefined for the whole process
//   item?: string,

//   details?: Details,
// }

// export type BackgroundTaskInfo<Details = void, TaskType = BackgroundTaskType> = TaskId<TaskType> & TaskInfo<Details>

// export type BackgroundTaskCallback = (info: BackgroundTaskInfo) => void;
