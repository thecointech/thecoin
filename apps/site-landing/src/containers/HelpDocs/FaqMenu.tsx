import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Renderer } from "./Renderer/Renderer";
import { Link } from 'react-router-dom';
import styles from "./styles.module.less";
import { List, Rail } from "semantic-ui-react";

type Props = {
    categories: any
  }
  
function displayEntry(index: number, name: string, subentries: FAQDocument[] ){
    return <List.Item key={index}><Link to={"/faq/theme-"+((name)?.split("-"))[0].replace(/ /g, '')}>{((name.split("-"))[1])}</Link>
                <List>
                    { 
                        subentries.map((entrySubentries) => ( 
                            <List.Item key={entrySubentries.id}>
                                <Renderer r={entrySubentries.data.question} />
                            </List.Item> ))
                    }
                </List>
            </List.Item>
}

export const FaqMenu = ({ categories }: Props) => {
    return (
        <Rail internal position='right'>
            <div className={styles.menuFaq}>
                <List divided relaxed className={"x10spaceBefore x8spaceAfter"}>
                    { Object.entries(categories).map((entry, index) => ( displayEntry(index, entry[0], entry[1] as FAQDocument[] ))) }
                </List>
            </div>
        </Rail>
    )
}