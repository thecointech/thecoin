import React from 'react';
import "@the-coin/site-semantic-theme/semantic.less"

export type FontProps = {
  classname: string,
  text: string,
}
export const Font: React.FC<FontProps> = (props) => <div className={props.classname}>{props.text}</div>
