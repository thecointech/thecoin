import React from "react";
import { FormattedMessage } from "react-intl";
import styles from './styles.module.less';

export type Props = {
    id: string,
    name: string,
    value: string,
    defaultChecked: boolean,
    img: string,
    message: {id:string,defaultMessage:string,description?:string }
}

export const StyledChoice = (props: Props) => {
    return (
        <div className={ `${styles.selectableCards}` }>
            <input id={props.id} type="radio" name={props.name} value={props.value} defaultChecked={true} />
            <label htmlFor={props.id}>
                <img src={props.img} />
                <br />
                <div className={ "font-small font-bold font-black" }><FormattedMessage {...props.message} /></div>
            </label>
        </div>
    );
}