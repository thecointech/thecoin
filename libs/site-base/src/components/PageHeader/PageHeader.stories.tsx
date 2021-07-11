import React from 'react';
import { PageHeader } from '.';

export default {
  title: "Base/Header",
  component: PageHeader,
};

export const Header = {
  args: {
    above: "Above the Title",
    title: "This is the Title",
  },
  render: (args: any) =>
    <>
      <PageHeader
        above={{id: "one", defaultMessage: args.above}}
        title={{id: "two", defaultMessage: args.title}}
      />
      <p>Ipsum Lorem Ladadada</p>
    </>
}
