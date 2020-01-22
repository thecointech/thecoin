import React from "react";

type Props = {
  id: string
}
export const FAQ = (props: Props) => {
  return <div>I am: {props.id}</div>;
}