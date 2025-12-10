import React from 'react';
import { RichTextField } from '@prismicio/client';
import { JSXMapSerializer, PrismicRichText, PrismicLink } from '@prismicio/react';

export const richTextComponents: JSXMapSerializer = {
  label: ({ node, children }) => {
    if (node.data.label === 'codespan') {
      return <code>{children}</code>;
    }
    return children;
  },
  heading1: ({ children }) => (
    <h1>{children}</h1>
  ),
  heading2: ({ children }) => <h2>{children}</h2>,
  heading3: ({ children }) => <h3>{children}</h3>,
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
