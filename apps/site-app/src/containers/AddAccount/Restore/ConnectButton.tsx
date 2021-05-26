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


export const ConnectButton = (props: Props) => {
  const { isVisible, disabled, loading } = props;

  const onClick = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event?.preventDefault();
    props.onClick();
  }, [props.onClick]);
  return isVisible
    ? <Form>
      <ButtonPrimary onClick={onClick} disabled={disabled} loading={loading} >
        <FormattedMessage {...connectButton} />
      </ButtonPrimary>
    </Form>
    : null;
}
