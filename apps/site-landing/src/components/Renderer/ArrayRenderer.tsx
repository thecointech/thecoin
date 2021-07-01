import React from "react";
import { RenderableType } from "components/Prismic/types";
import { ElementRender } from "./ElementRender";

type Props = {
  renderables: RenderableType[]
}
export const ArrayRenderer = (props: Props) =>
  <>
    {props.renderables?.map((e, idx) => <ElementRender key={idx} {...e} />)}
  </>