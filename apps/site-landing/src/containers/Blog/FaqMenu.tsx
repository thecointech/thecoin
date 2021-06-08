import React from "react";
//import { Renderer } from "./Renderer/Renderer";
import { Link } from 'react-router-dom';
import styles from "./styles.module.less";
import { List, Rail } from "semantic-ui-react";
import { GreaterThanMobileSegment, MobileSegment } from "@thecointech/shared/components/ResponsiveTool";

type Props = {
    categories: any
  }
  
function displayEntry(index: number, name: string ){
    return <List.Item key={index}><Link to={"/faq/theme-"+((name)?.split("-"))[0].replace(/ /g, '')}>{((name.split("-"))[1])}</Link>
                { /* <List> */ }
                    { /*
                        subentries.map((entrySubentries) => ( 
                            <List.Item key={entrySubentries.id}>
                                <Renderer r={entrySubentries.data.question} />
                            </List.Item> ))*/
                    }
                { /* <List> */ }
            </List.Item>
}


export const FaqMenu = ({ categories }: Props) => {
    console.log("categories===",categories)
    return (
        <>
            <GreaterThanMobileSegment>
                <Rail position='right'>
                    <div id={styles.menuFaq}>
                        <List divided relaxed size={"massive"} className={"x10spaceBefore x8spaceAfter"}>
                            { Object.entries(categories).map((entry, index) => ( displayEntry(index, entry[0] ))) }
                        </List>
                    </div>
                </Rail>
            </GreaterThanMobileSegment>

            <MobileSegment>
                <div id={styles.menuFaq}>
                    <List divided relaxed size={"massive"} className={"x10spaceBefore x8spaceAfter"}>
                        { Object.entries(categories).map((entry, index) => ( displayEntry(index, entry[0] ))) }
                    </List>
                </div>
            </MobileSegment>
        </>
    )
}