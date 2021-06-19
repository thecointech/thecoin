import React from "react";
import { Link } from 'react-router-dom';
import { List, Rail, SemanticFLOATS } from "semantic-ui-react";
import { GreaterThanMobileSegment, MobileSegment } from "@thecointech/shared/components/ResponsiveTool";

type Props = {
    categories: any,
    idForMenu: any,
    railPosition: SemanticFLOATS,
    pathBeforeTheId: string
  }
  
function displayEntry(index: number, name: string, pathBeforeTheId: string ){
    return <List.Item key={index}>
                <Link to={pathBeforeTheId+((name)?.split("-"))[0].replace(/ /g, '')}>{((name.split("-"))[1])}</Link>
            </List.Item>
}

export const CategoryMenu = ({ categories,idForMenu,railPosition,pathBeforeTheId }: Props ) => {
    return (
        <>
            <GreaterThanMobileSegment>
                <Rail position={railPosition}>
                    <div id={idForMenu}>
                        <List divided relaxed size={"massive"} className={"x10spaceBefore x8spaceAfter"}>
                            { Object.entries(categories).map((entry, index) => ( displayEntry(index, entry[0], pathBeforeTheId ))) }
                        </List>
                    </div>
                </Rail>
            </GreaterThanMobileSegment>

            <MobileSegment>
                <div id={idForMenu}>
                    <List divided relaxed size={"massive"} className={"x10spaceBefore x8spaceAfter"}>
                        { Object.entries(categories).map((entry, index) => ( displayEntry(index, entry[0], pathBeforeTheId ))) }
                    </List>
                </div>
            </MobileSegment>
        </>
    )
}