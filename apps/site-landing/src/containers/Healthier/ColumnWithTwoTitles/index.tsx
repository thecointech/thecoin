import { MessageDescriptor, FormattedMessage } from 'react-intl';
import React, { CSSProperties } from 'react';

export type Props = {
    FirstTitle: string;
    FirstHeaderMessage: MessageDescriptor;
    SecondTitle: string;
    SecondHeaderMessage: MessageDescriptor;
    CssForSeparator: CSSProperties | undefined;
} 

export const ColumnWithTwoTitles = (props: Props) => {
    return (
        <>
            <h2 className={ `x6spaceBefore` }>{ props.FirstTitle }</h2>
            <div><FormattedMessage {...props.FirstHeaderMessage} /></div>
            <hr style={ props.CssForSeparator } className={ `x12spaceBefore x10spaceAfter` } />
            <h2 className={ `x24spaceBefore` }>{ props.SecondTitle }</h2>
            <div><FormattedMessage {...props.SecondHeaderMessage} /></div>
        </>
    )
}