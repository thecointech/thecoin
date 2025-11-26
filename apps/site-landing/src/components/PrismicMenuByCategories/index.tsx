import React from "react";
import { Link } from "@thecointech/shared";
import { List, Rail, SemanticFLOATS } from "semantic-ui-react";
import { GreaterThanMobileSegment, MobileSegment } from "@thecointech/shared/components/ResponsiveTool";

type Props = {
  categories: string[],
  idForMenu: string,
  railPosition: SemanticFLOATS,
  pathBeforeTheId: string
}

function displayEntry(index: number, name: string, pathBeforeTheId: string) {
  return <List.Item key={index}>
    <Link to={pathBeforeTheId + name}>{name}</Link>
  </List.Item>
}

export const CategoryMenu = ({ categories, idForMenu, railPosition, pathBeforeTheId }: Props) => {
  categories.sort();
  return (
    <>
      <GreaterThanMobileSegment>
        <Rail position={railPosition}>
          <div id={idForMenu}>
            <List divided relaxed size={"massive"} className={"x10spaceBefore x8spaceAfter"}>
              {categories.map((entry, index) => (displayEntry(index, entry, pathBeforeTheId)))}
            </List>
          </div>
        </Rail>
      </GreaterThanMobileSegment>

      <MobileSegment>
        <div id={idForMenu}>
          <List divided relaxed size={"massive"} className={"x10spaceBefore x8spaceAfter"}>
            {categories.map((entry, index) => (displayEntry(index, entry, pathBeforeTheId)))}
          </List>
        </div>
      </MobileSegment>
    </>
  )
}
