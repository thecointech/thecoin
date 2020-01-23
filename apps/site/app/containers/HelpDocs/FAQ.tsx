import React from "react";
import { FAQDocument } from "containers/Prismic/types";
import { Segment, Item } from "semantic-ui-react";
import { Renderer } from "./Renderer/Renderer";
import { ArrayRenderer } from "./Renderer/ArrayRenderer";


export const FAQ = ({ data }: FAQDocument) =>
  <Item>
    <Item.Content>
      <Item.Header>
        <Renderer r={data.marketddown} />
      </Item.Header>
      <Item.Meta>Description</Item.Meta>
      <Item.Description>
        <Renderer r={data.answer} />
      </Item.Description>
      <Item.Extra>for more details, click here</Item.Extra>
    </Item.Content>
  </Item>