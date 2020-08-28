import { MessageDescriptor, FormattedMessage } from 'react-intl';
import React from 'react';

export type Props = {
    FirstTitle: string;
    FirstHeaderMessage: MessageDescriptor;
    SecondTitle: string;
    SecondHeaderMessage: MessageDescriptor;
} 

export const ColumnWithTwoTitles = (props: Props) => {
    return (
        <>
            <h2>{ props.FirstTitle }</h2>
            <FormattedMessage {...props.FirstHeaderMessage} />
            <hr />
            <h2>{ props.SecondTitle }</h2>
            <FormattedMessage {...props.SecondHeaderMessage} />
        </>
    )
}