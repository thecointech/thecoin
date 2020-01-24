import React from "react";
import { RenderableType } from "containers/Prismic/types";
import { ArrayRenderer } from "./ArrayRenderer";

type Props = {
  [index: string]: RenderableType[]|null
}

export const Renderer = (props: Props) =>
  <>
    {
      Object.keys(props)
        .filter(key => props[key])
        .map((key, idx) => <ArrayRenderer key={idx} renderables={props[key]!} />)
    }
  </>