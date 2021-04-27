import * as React from 'react';
import { Message, StrictButtonProps } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import { ButtonSecondary } from '@thecointech/site-base/components/Buttons';
import { UxInput } from '@thecointech/shared/components/UxInput';

import styles from './styles.module.less';

type VisualProps={

    errorMessage: MessageDescriptor,
    errorHidden: boolean,
    successMessage: MessageDescriptor,
    successHidden: boolean,

    messageLabel: MessageDescriptor,
    setMessage: (event: React.FormEvent<HTMLInputElement>) => void,
    messageDes: string,

    button: MessageDescriptor,

    onSubmit: StrictButtonProps["onClick"],
};
  

export const ContactForm = (props: VisualProps) => {
  return (
    <div className={styles.contactusForm}>
        <Message hidden={props.successHidden} positive>
          <FormattedMessage {...props.successMessage} />
        </Message>
        <Message hidden={props.errorHidden} negative>
          <FormattedMessage {...props.errorMessage} />
        </Message>

        <UxInput
            className={"half left"}
            uxChange={props.setMessage}
            placeholder={props.messageDes}
            name="email"
          />
        <ButtonSecondary className={"x4spaceBefore x2spaceAfter"} onClick={props.onSubmit} >
          <FormattedMessage {...props.button} />
        </ButtonSecondary>
    </div>
  );
}