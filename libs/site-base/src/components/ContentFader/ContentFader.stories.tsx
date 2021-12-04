import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentFader } from '.';

export default {
  title: "Base/Fader",
  component: ContentFader,
};

export const Fader = () => {
  const [inProp, setInProp] = useState(false);
  const href = `${inProp}`;
  const style = {
    backgroundColor: inProp ? "beige" : "lightBlue",
    border: "1px solid lightGray",
    wdith: "500px",
  }
  const text = inProp
    ? <p>Ipsum Lorem Ladadada</p>
    : <>
      <p>a different and much longer piece of text</p>
      <p>with multiple lines</p>
      </>
  return (
    <ContentFader>
      <div style={style}>
        {text}
        <Link to={`./?${inProp}`} onClick={() => setInProp(!inProp)}>
          Switching to {href}
        </Link>
      </div>
    </ContentFader >
  )
}
