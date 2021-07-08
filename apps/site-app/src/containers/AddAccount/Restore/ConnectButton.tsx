import { Form } from "semantic-ui-react"
import React, { useCallback } from "react"
import { ButtonPrimary } from "@thecointech/site-base/components/Buttons";
import { defineMessages, FormattedMessage } from "react-intl";

type Props = {
  disabled: boolean,
  loading: boolean,
  isVisible: boolean;
  onClick: () => void;
}

const translations = defineMessages({
  connectButton : {
      defaultMessage: 'Restore from Google',
      description: 'app.addAccount.restore.connectButton: The text for the create your password text'}
});
     
export const ConnectButton : React.FC<Props> = (props)=> {
  const { isVisible, disabled, loading } = props;

  const onClick = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event?.preventDefault();
    props.onClick();
  }, [props.onClick]);
  const linkToRestore = props.children 
      ?   <a onClick={()=>onClick}>
            {props.children}
          </a>
      : <Form>
          <ButtonPrimary onClick={onClick} disabled={disabled} loading={loading} >
            <FormattedMessage {...translations.connectButton} />
          </ButtonPrimary>
        </Form>;

  return isVisible
    ? linkToRestore
    : null;
}
