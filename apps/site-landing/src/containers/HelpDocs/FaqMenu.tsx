import React from "react";
import { FAQDocument } from "components/Prismic/types";
import { Renderer } from "./Renderer/Renderer";
import { Link } from 'react-router-dom';
import { RUrl } from "@thecointech/utilities/RUrl";

type Props = {
    faqs: FAQDocument[],
    categories: Dictionary<FAQDocument[]>
  }
  
function displayEntry(index: number, name: string, subentries: any ){
    return <li key={index}><Link to={"/faq/"+name.replace(/ /g, '-').replace('&', 'n').toLocaleLowerCase()}>{name}</Link>
                <ul>
                    { 
                        subentries.map((entrySubentries, indexSubentries) => ( 
                            <li key={entrySubentries.id}>
                                <Renderer r={entrySubentries.data.question} />
                            </li> ))
                    }
                </ul>
            </li>
}


export const FaqMenu = ({ faqs, categories }: Props) => {

      
    return (
        <ul className={"x10spaceBefore x8spaceAfter"}>
            { Object.entries(categories)
                .map((entry, index) => ( displayEntry(index, entry[0], entry[1] )
            ))}
        </ul>
    )
}