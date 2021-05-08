import * as React from 'react';
import { Message, StrictButtonProps } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import styles from './styles.module.less';
import { ButtonSecondary } from '@thecointech/site-base/components/Buttons';

type VisualProps={

    errorMessage: MessageDescriptor,
    errorHidden: boolean,
    successMessage: MessageDescriptor,
    successHidden: boolean,

    button: MessageDescriptor,
    onSubmit: StrictButtonProps["onClick"],
};
  

export const ContactForm = (props: VisualProps) => {
  return (
    <div>
        <Message hidden={props.successHidden} positive>
          <FormattedMessage {...props.successMessage} />
        </Message>
        <Message hidden={props.errorHidden} negative>
          <FormattedMessage {...props.errorMessage} />
        </Message>
      <div>
        <div>
          <textarea className={styles.messageField}></textarea>
            
          <ButtonSecondary className={"x4spaceBefore x2spaceAfter"} onClick={props.onSubmit} disabled={true} >
            <FormattedMessage {...props.button} />
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}