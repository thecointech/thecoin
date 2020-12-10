import React from 'react';
import "@the-coin/site-base/build/styles/semantic.less"

export type LinkProps = {
  text: string
}
export const Link: React.FC<LinkProps> = (props) => <a href="/">{props.text}</a>
