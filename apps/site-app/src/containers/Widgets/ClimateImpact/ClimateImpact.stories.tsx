import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Visual } from './Visual/index';
import { options } from './Widget';
import { defineMessage } from 'react-intl';
import { WidgetWrapper } from '../index';
import appstyles from '../../App/styles.module.less';
import { withAccounts } from '@thecointech/storybookutils';

const title = defineMessage({
  id: "shared.widgets.climateimpact.title",
  defaultMessage: "Climate Impact",
});

const args = {
  quantity: "80",
  title,
  itemChosen: 0,
}
export default {
  title: 'App/Widgets/Impact',
  component: Visual,
  args,
  argTypes: {
    itemChosen: {
      control: {
        type: 'select',
        options: Object.keys(options)
      },
    },
  },
  decorators: [
    withAccounts(),
  ]
} as Meta;


export const Impact: StoryFn<typeof args> = (args) => {
  const selectedOption = options[args.itemChosen] ? options[args.itemChosen] : options[0];
  return (
    <div id={appstyles.app}>
      <WidgetWrapper area="bottom">
        <Visual title={args.title} quantity={args.quantity} item={selectedOption} />
      </WidgetWrapper>
    </div>
  )
}

