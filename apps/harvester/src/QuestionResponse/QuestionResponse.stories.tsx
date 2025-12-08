import React, { useRef } from 'react';
import { StoryObj, Meta, StoryFn } from '@storybook/react-webpack5';
import { QuestionResponse } from './QuestionResponse';
import { withAskQuestion } from './scraper-mock';
import "semantic-ui-css/semantic.min.css"


const QuestionResponseWithSize = () => {
  const [mountNode, setMountNode] = React.useState<HTMLDivElement | null>(null);
  return (
    <div ref={setMountNode} style={{ width: '400px', height: '600px' }}>
      <QuestionResponse mountNode={mountNode} />
    </div>
  )
}

const meta = {
  title: 'Harvester/QuestionResponse',
  component: QuestionResponseWithSize,
  decorators: [withAskQuestion],
} satisfies Meta<typeof QuestionResponse>;


type Story = StoryObj<typeof meta>;
export default meta;

export const Default: Story = {
  args: {
    question: {
      questionId: 'test',
      question: 'What is your name?',
    }
  },
}
export const OptionsSelect: Story = {
  args: {
    question: {
      questionId: 'test',
      question: 'Select an Option',
      options: ['Option 1', 'Option 2'],
    }
  },
};

export const Options2DSelect: Story = {
  args: {
    question: {
      questionId: 'test',
      question: 'Select an Option',
      options2d: [
        { name: 'Option 1', options: ['Option 1', 'Option 2'] },
        { name: 'Option 2', options: ['Option 1', 'Option 2'] },
      ],
    }
  },
};

export const Confirm: Story = {
  args: {
    question: {
      questionId: 'test',
      confirm: 'Do you want to click yes?',
    }
  },
};

