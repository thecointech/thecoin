import { Form } from "semantic-ui-react"
import React, { useCallback } from "react"
import { ButtonPrimary } from "@thecointech/site-base/components/Buttons";

type Props = {
  disabled: boolean,
  loading: boolean,
  isVisible: boolean;
  onClick: () => void;
}
export const ConnectButton = (props: Props) => {
  const { isVisible, disabled, loading } = props;

  const onClick = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event?.preventDefault();
    props.onClick();
  }, [props.onClick]);
  return isVisible
    ? <Form>
      <ButtonPrimary onClick={onClick} disabled={disabled} loading={loading} >
        Restore from Google
      </ButtonPrimary>
    </Form>
    : null;
}
