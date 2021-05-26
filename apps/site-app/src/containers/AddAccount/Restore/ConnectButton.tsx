import { Form } from "semantic-ui-react"
import React, { useCallback } from "react"
import { ButtonPrimary } from "@thecointech/site-base/components/Buttons";
import { FormattedMessage } from "react-intl";

type Props = {
  disabled: boolean,
  loading: boolean,
  isVisible: boolean;
  onClick: () => void;
}

const connectButton = { id:"app.addAccount.restore.connectButton.",
                    defaultMessage:"Restore from Google",
                    description:"The text for the create your password text"};


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
            <FormattedMessage {...connectButton} />
          </ButtonPrimary>
        </Form>;

  return isVisible
    ? linkToRestore
    : null;
}
