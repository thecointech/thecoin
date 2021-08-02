import "@thecointech/site-semantic-theme/semantic.less"
import React from 'react';
import { Story, Meta } from '@storybook/react';
import { PageSidebar, Props } from '.';
import { withStore } from '@thecointech/storybookutils';
import ConstantSidebarItems from './Sidebar.stories.data.json';
import { SemanticICONS } from 'semantic-ui-react';

const header = ConstantSidebarItems.header;
const links = ConstantSidebarItems.links.map(l => ({
  ...l,
  icon: l.icon as SemanticICONS,
}))

export default {
  title: 'Shared/Sidebar',
  component: PageSidebar,
} as Meta;

const Template: Story<Props> = (args) => <PageSidebar {...args} />

export const Basic = Template.bind({});
Basic.args = {}
Basic.decorators = [
  withStore({
    sidebar: {
      generators: {},
      items: { header, links },
      visible: true,
    }
  })
]

export const WithGenerator = Template.bind({});
WithGenerator.args = {}
WithGenerator.decorators = [
  withStore({
    sidebar: {
      visible: true,
      items: {
        header: null,
        links,
      },
      generators: {
        header: (items) => ({
          ...items,
          header,
          visible: true,
        })
      }
    }
  })
]
