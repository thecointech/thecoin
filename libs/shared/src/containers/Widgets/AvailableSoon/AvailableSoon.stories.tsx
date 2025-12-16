import React from 'react';
import { Icon } from 'semantic-ui-react';
import { AvailableSoon } from './';
import { languageDecorator } from '../../../../internal/languageDecorator';

export default {
  title: "Shared/Availablesoon",
  component: AvailableSoon,
  decorators: languageDecorator
};

const Sample = ({width, height} : {width: number, height: number}) => (
  <div style={{ backgroundColor: 'lightGray', width, height, borderRadius: 10, padding: "1rem", margin: "1rem", display: "inline-block" }}>
    <Icon name="magnify" size="massive" />
    <p>
      Some Content
    </p>
    <p>
      Some Content
    </p>
    <p>
      Some Content
    </p>
  </div>
)

export const Availablesoon = {
  args: {
    width: 200,
    height: 300,
  },
  render: (args: any) => (
    <>
      <AvailableSoon>
        <Sample {...args} />
      </AvailableSoon>
      <Sample {...args} />
      <br />
      <Sample {...args} />
    </>
  )
}
