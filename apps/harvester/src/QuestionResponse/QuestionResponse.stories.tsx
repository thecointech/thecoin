import React, { useEffect } from 'react';
import { StoryObj, Meta } from '@storybook/react-webpack5';
import { QuestionResponse } from './QuestionResponse';
import { withAskQuestion, triggerClearQuestion } from './scraper-mock';
import "semantic-ui-css/semantic.min.css";


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
      header: 'The app has a question for you',
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
      header: 'Select an Option',
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

const AutoClearWrapper = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerClearQuestion({});
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return <QuestionResponseWithSize />;
};

export const AutoClearAfter5Seconds: Story = {
  args: {
    question: {
      questionId: 'test',
      header: 'Approve the login request in your mobile app',
      confirm: 'This dialog should disappear after 5 seconds',
    }
  },
  render: () => <AutoClearWrapper />,
};

