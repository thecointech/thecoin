import React from 'react';
import { RichTextField } from '@prismicio/client';
import { JSXMapSerializer, PrismicRichText, PrismicLink } from '@prismicio/react';
import { Header } from 'semantic-ui-react';

export const richTextComponents: JSXMapSerializer = {
  label: ({ node, children }) => {
    if (node.data.label === 'codespan') {
      return <code>{children}</code>;
    }
    return children;
  },
  heading1: ({ children }) => (
    <Header as="h1">{children}</Header>
  ),
  heading2: ({ children }) => <Header as="h2">{children}</Header>,
  heading3: ({ children }) => <Header as="h3">{children}</Header>,
  heading4: ({ children }) => <Header as="h4">{children}</Header>,
  heading5: ({ children }) => <Header as="h5">{children}</Header>,
  heading6: ({ children }) => <Header as="h6">{children}</Header>,
  paragraph: ({ children }) => <p>{children}</p>,
  hyperlink: ({ children, node }) => (
    <PrismicLink field={node.data}>{children}</PrismicLink>
  ),
};

interface RichTextProps {
  field: RichTextField;
}

export const RichText = ({ field }: RichTextProps) => {
  return <PrismicRichText field={field} components={richTextComponents} />;
};
