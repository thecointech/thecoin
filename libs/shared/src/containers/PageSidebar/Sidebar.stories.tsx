import {MainRouterStorybook} from './Sidebar.defaultroutes.stories';
import "@the-coin/site-semantic-theme/semantic.less"
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
  title: 'App/Sidebar',
  component: PageSidebar,
  args: {
    text: "This is the content",
    visible: true,
    minimize: false,
    inverted: false
  }
} as Meta;

const Template: Story<SidebardProps> = (args) =>
<div>
  <PageSidebar visible={args.visible} inverted={args.inverted} />
    <MainRouterStorybook /> {args.text}
    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    <br /><br />;
</div>

export const Basic = Template.bind({});
Basic.args = {}
