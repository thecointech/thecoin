import React from 'react';
import { Meta, Story } from '@storybook/react';
import { AccountSwitcher as AccountSwitcherComponent } from '.';
import { AccountState } from '@thecointech/shared/containers/Account';
import { withAccounts } from '@thecointech/storybookutils';

export default {
  title: 'App/AccountSwitcher',
  component: AccountSwitcherComponent,
} as Meta;

const Template: Story = () => <AccountSwitcherComponent />;

export const NoAccounts = Template.bind({});
NoAccounts.decorators = [
  withAccounts({
    active: null,
    map: {}
  }),
]

export const WithAccounts = Template.bind({});
WithAccounts.decorators = [
  withAccounts({
    active: "0x1234567890123456789012345678901234567890",
    map: {
      "0x1234567890123456789012345678901234567890": {
        name: "First Acc",
        address: "0x1234567890123456789012345678901234567890",
      } as AccountState,
      "0xA234567890123456789012345678901234567890": {
        name: "Next Acc",
        address: "0xA234567890123456789012345678901234567890",
      } as AccountState,
    }
  }),
]
