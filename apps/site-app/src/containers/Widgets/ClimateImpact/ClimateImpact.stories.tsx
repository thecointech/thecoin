import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Visual } from './Visual/index';
import { options } from './Widget';
import { defineMessage } from 'react-intl';
import appstyles from '../../App/styles.module.less';
import styles from './styles.module.less';

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
} as Meta;


export const Impact: Story<typeof args> = (args) => {
  const selectedOption = options[args.itemChosen] ? options[args.itemChosen] : options[0];
  return (
    <div id={appstyles.app}>
      <div className={styles.columnRightBottom}>
        <Visual title={args.title} quantity={args.quantity} item={selectedOption} />
      </div>
    </div>
  )
}

