import React from 'react';
import { RichTextField } from '@prismicio/client';
import { JSXMapSerializer, PrismicRichText, PrismicLink } from '@prismicio/react';
import { Header } from 'semantic-ui-react';

const renderCo2eWithSubscript = (text: string): React.ReactNode => {
  const parts = text.split(/(CO2)/g);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => {
    if (part === 'CO2') {
      return (
        <React.Fragment key={`co2-${index}`}>
          CO<sub>2</sub>
        </React.Fragment>
      );
    }

    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
  });
};

const transformChildren = (children: React.ReactNode): React.ReactNode =>
  React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return renderCo2eWithSubscript(child);
    }

    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<{ children?: React.ReactNode }>;

      if (element.props.children == null) {
        return child;
      }

      return React.cloneElement(element, undefined, transformChildren(element.props.children));
    }

    return child;
  });

export const richTextComponents: JSXMapSerializer = {
  label: ({ node, children }) => {
    if (node.data.label === 'codespan') {
      return <code>{children}</code>;
    }
    return transformChildren(children);
  },
  heading1: ({ children }) => (
    <Header as="h1">{transformChildren(children)}</Header>
  ),
  heading2: ({ children }) => <Header as="h2">{transformChildren(children)}</Header>,
  heading3: ({ children }) => <Header as="h3">{transformChildren(children)}</Header>,
  heading4: ({ children }) => <Header as="h4">{transformChildren(children)}</Header>,
  heading5: ({ children }) => <Header as="h5">{transformChildren(children)}</Header>,
  heading6: ({ children }) => <Header as="h6">{transformChildren(children)}</Header>,
  paragraph: ({ children }) => <p>{transformChildren(children)}</p>,
  hyperlink: ({ children, node }) => (
    <PrismicLink field={node.data}>{transformChildren(children)}</PrismicLink>
  ),
};

interface RichTextProps {
  field: RichTextField;
}

export const RichText = ({ field }: RichTextProps) => {
  return <PrismicRichText field={field} components={richTextComponents} />;
};
