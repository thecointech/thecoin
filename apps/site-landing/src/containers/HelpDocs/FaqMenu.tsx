import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Renderer } from "./Renderer/Renderer";
import { Link } from 'react-router-dom';

type Props = {
    categories: any
  }
  
function displayEntry(index: number, name: string, subentries: FAQDocument[] ){
    return <li key={index}><Link to={"/faq/theme-"+((name)?.split("-"))[0].replace(/ /g, '')}>{((name.split("-"))[1])}</Link>
                <ul>
                    { 
                        subentries.map((entrySubentries) => ( 
                            <li key={entrySubentries.id}>
                                <Renderer r={entrySubentries.data.question} />
                            </li> ))
                    }
                </ul>
            </li>
}


export const FaqMenu = ({ categories }: Props) => {

      
    return (
        <ul className={"x10spaceBefore x8spaceAfter"}>
            { Object.entries(categories)
                .map((entry, index) => ( displayEntry(index, entry[0], entry[1] as FAQDocument[] )
            ))}
        </ul>
    )
}