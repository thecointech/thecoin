import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Header } from "semantic-ui-react";
import { Renderer } from "./Renderer/Renderer";

export const FAQ = ({ data }: FAQDocument) =>
  <div>
    <Header as={"h3"}><Renderer r={data.question} /></Header>
    <Renderer r={data.answer} />
  </div>