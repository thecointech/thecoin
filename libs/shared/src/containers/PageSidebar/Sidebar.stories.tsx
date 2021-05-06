import "@thecointech/site-semantic-theme/semantic.less"
import React from 'react';
import { Story, Meta } from '@storybook/react';
import { PageSidebar } from '.';
import { Route } from 'react-router';
import { withStore } from '@thecointech/storybookutils';
import { ApplicationBaseState } from 'types';
import ConstantSidebarItems from './Sidebar.stories.data.json';
import { MapMenuItems } from './types';

export type SidebardProps = {
    text: string
    visible: boolean
    minimize: boolean
    links: Route
    inverted: boolean
    header: { title: string, avatar: string, primaryDescription: string, secondaryDescription: string }
  }

export default {
  title: 'Shared/Sidebar',
  component: PageSidebar,
  args: {
    visible: true,
    minimize: false,
    inverted: false
  }
} as Meta;

const Template: Story<SidebardProps> = (args) => <PageSidebar {...args} />

export const Basic = Template.bind({});
Basic.args = {}
Basic.decorators = [
  withStore<ApplicationBaseState>({
    sidebar: {
      generators: {
        SampleGenerator: () => MapMenuItems(ConstantSidebarItems as any, "/")
      },
    }
  })
]

