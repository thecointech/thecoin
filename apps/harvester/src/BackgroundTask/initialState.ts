import { GroupTask, SubTask } from "./types";

export type GroupAndSubTask = GroupTask & {
  subTasks: SubTask[]
};
type GroupTaskStore = GroupAndSubTask[];

export const initialState = {
  groups: [] as GroupTaskStore,
}
export type InitialState = typeof initialState;
