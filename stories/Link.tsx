import React from 'react';
import "@thecointech/site-semantic-theme/semantic.less"

export type LinkProps = {
  text: string
}
export const Link: React.FC<LinkProps> = (props) => <a href="/">{props.text}</a>
