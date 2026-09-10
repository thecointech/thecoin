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
      header: "Enter 2FA Code",
      question: "Enter the security code we just texted to the number ending in 7890. The code will expire within 5 minutes.",
    }
  },
}
export const OptionsSelect: Story = {
  args: {
    question: {
      questionId: 'test',
      header: 'Select an Option',
      question: 'The Choices',
      options: ['Option 1', 'Option 2'],
    }
  },
};

export const Options2DSelect: Story = {
  args: {
    question: {
      questionId: 'test',
      header: "Select Destination",
      question: "Select where to send your 2FA code",
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
      question: "Do you want to click yes?",
      confirmBtn: 'Yes!',
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

const message = "For added security, you need to verify this login by authenticating in your banking app. In-app authentication is a more secure way to verify your identity when you log in.";
const question = `${message}\n\nOnce approved, this page should automatically refresh.  If it does not, click Override & Continue`
export const AutoClearAfter5Seconds: Story = {
  args: {
    question: {
      questionId: 'test',
      header: "Approve in App",
      question,
      confirmBtn: "Override & Continue",
    }
  },
  render: () => <AutoClearWrapper />,
};

