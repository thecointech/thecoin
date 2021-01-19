import {MainRouterStorybook} from './MainRouterStorybook';
import "@the-coin/site-base/build/styles/semantic.less";
import React from 'react';
import { Story, Meta } from '@storybook/react';
import { PageSidebar } from '.';
import { Route } from 'react-router';

export type SidebardProps = {
    text: string
    visible: boolean
    minimize: boolean
    links: Route
    inverted: boolean
    header: { title: string, avatar: string, primaryDescription: string, secondaryDescription: string }
  }

export default {
  title: 'SemanticUI/Sidebar',
  component: PageSidebar,
  args: {
    text: "This is the content",
    visible: true,
    minimize: false,
    inverted: false
  }
} as Meta;

const Template: Story<SidebardProps> = (args) => 
  <PageSidebar visible={args.visible} inverted={args.inverted}>
    <MainRouterStorybook /> {args.text}
    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
  </PageSidebar>;

export const Basic = Template.bind({});
Basic.args = {}
