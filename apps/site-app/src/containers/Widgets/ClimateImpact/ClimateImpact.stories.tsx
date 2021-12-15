import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Visual, VisualProps } from './Visual';
import { options } from './Widget';
import { defineMessages, IntlProvider } from 'react-intl';


const translate = defineMessages({
  title : {
    id: "shared.widgets.climateimpact.title",
    defaultMessage: "Climate Impact",
    description: "shared.widgets.climateimpact.title: Title for the Widget Climate impact in the app"
  }});

export default {
  title: 'App/ClimateImpact',
  component: Visual,
  args: {
    quantity: "80",
    title: {...translate.title}
  },
  argTypes: {
    itemChosen: {
        control: {
          type: 'select',
          options: Object.keys(options)
        },
    },
  },
} as Meta;


const Template: Story<VisualProps> = (args) => {
    const selectedOption = options[args.itemChosen] ? options[args.itemChosen] : options[0];
    return <IntlProvider locale="en"><Visual title={args.title} quantity={args.quantity} item={selectedOption} /></IntlProvider>;
}

export const Basic = Template.bind({});
Basic.args = {}