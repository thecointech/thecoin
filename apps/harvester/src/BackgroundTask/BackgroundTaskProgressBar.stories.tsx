import React from 'react';
import { Meta, StoryObj } from '@storybook/react-webpack5';
import { BackgroundTaskProgressBar } from './BackgroundTaskProgressBar';
import type { BackgroundTaskType } from './types';
import type { GroupAndSubTask } from './initialState';
import type { SubTask } from './types';
import { withReducer, withStore } from '@thecointech/storybookutils';
import { BackgroundTaskReducer } from './reducer';
import "semantic-ui-css/semantic.min.css";

const now = () => Date.now();

const group = (type: BackgroundTaskType, opts: Partial<GroupAndSubTask> = {}): GroupAndSubTask => ({
  timestamp: now(),
  id: `${type}-group-1`,
  type,
  percent: 0,
  subTasks: [],
  ...opts,
});

const subTask = (parentId: string, type: BackgroundTaskType, subTaskId: string, opts: Partial<SubTask> = {}): SubTask => ({
  parentId,
  type,
  subTaskId,
  percent: 0,
  ...opts,
});

const stateForGroups = (groups: GroupAndSubTask[]) => ({
  taskProgress: {
    groups,
  },
});

const meta = {
  title: 'Harvester/BackgroundTaskProgressBar',
  component: BackgroundTaskProgressBar,
  decorators: [
    withReducer(BackgroundTaskReducer),
    withStore(),
  ],
} satisfies Meta<typeof BackgroundTaskProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    type: 'initialize',
  },
};

export const RunningGroup: Story = {
  args: {
    type: 'initialize',
  },
  decorators: [
    withReducer(BackgroundTaskReducer),
    withStore(stateForGroups([
      group('initialize', {
        percent: 35,
      }),
    ]) as any),
  ],
};

export const RunningWithSubTasks: Story = {
  args: {
    type: 'initialize',
  },
  decorators: [
    withReducer(BackgroundTaskReducer),
    withStore((() => {
      const g = group('initialize', { percent: 50 });
      const st1 = subTask(g.id, g.type, 'chrome', { percent: 25 });
      const st2 = subTask(g.id, g.type, 'tokenizer.json', { percent: 75 });
      return stateForGroups([
        {
          ...g,
          subTasks: [st1, st2],
        },
      ]);
    })() as any),
  ],
};

export const CompletedSuccess: Story = {
  args: {
    type: 'initialize',
    alwaysDisplay: true,
  },
  decorators: [
    withReducer(BackgroundTaskReducer),
    withStore(stateForGroups([
      group('initialize', {
        percent: 100,
        completed: true,
      }),
    ]) as any),
  ],
};

export const CompletedError: Story = {
  args: {
    type: 'initialize',
    alwaysDisplay: true,
  },
  decorators: [
    withReducer(BackgroundTaskReducer),
    withStore((() => {
      const g = group('initialize', { percent: 60, completed: true });
      const st1 = subTask(g.id, g.type, 'chrome', { percent: 100, completed: true });
      const st2 = subTask(g.id, g.type, 'onnx/model_quantized.onnx', { error: 'Download failed', completed: true });
      return stateForGroups([
        {
          ...g,
          subTasks: [st1, st2],
        },
      ]);
    })() as any),
  ],
};

export const CloseOnComplete: Story = {
  args: {
    type: 'initialize',
    closeOnComplete: true,
    alwaysDisplay: true,
  },
  decorators: [
    withReducer(BackgroundTaskReducer),
    withStore(stateForGroups([
      group('initialize', {
        percent: 100,
        completed: true,
      }),
    ]) as any),
  ],
};
