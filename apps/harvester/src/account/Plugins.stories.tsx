import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react-webpack5';
import { withAccounts } from '@thecointech/storybookutils';
import { setAssignPluginFailure, type AssignPluginFailure } from '@thecointech/apis/broker/mocked';
import { ContentSection } from '@/ContentSection';
import { Plugins } from './Plugins';
import "semantic-ui-css/semantic.min.css";

// Simulates the broker-service rejecting the "assign plugin" request with the
// given failure mode for the lifetime of the story, so we can exercise the
// error-feedback UI added to Plugins.tsx without a real backend.
const withAssignPluginFailure = (failure: AssignPluginFailure) => (Story: React.ElementType) => {
  useEffect(() => {
    setAssignPluginFailure(failure);
    return () => setAssignPluginFailure(null);
  }, []);
  return <Story />;
};

const meta = {
  title: 'Harvester/Plugins',
  component: Plugins,
  // The mocked PluginsApi uses a single module-level flag to simulate failures
  // (see setAssignPluginFailure). Autodocs renders every story in this file
  // inline on one page simultaneously, so they'd all fight over that shared
  // flag. Opt out here and view/switch between stories in the Canvas instead.
  tags: ['!autodocs'],
  decorators: [
    withAccounts(),
    (Story) => <ContentSection><Story /></ContentSection>,
  ],
} satisfies Meta<typeof Plugins>;

export default meta;
type Story = StoryObj<typeof meta>;

// Happy path - clicking "Install" succeeds and the plugin requests are queued.
export const Default: Story = {};

// The client's clock is skewed enough that the server rejects the signature
// as timestamped in the future (the scenario that prompted this UI).
export const ClockSkewError: Story = {
  decorators: [withAssignPluginFailure('timestamp')],
};

// A generic 401 from the broker-service (e.g. signer mismatch) that doesn't
// match the clock-skew heuristic, exercising the fallback error message.
export const InvalidSignatureError: Story = {
  decorators: [withAssignPluginFailure('invalid-signature')],
};
