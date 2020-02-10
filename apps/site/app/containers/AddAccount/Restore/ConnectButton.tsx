import { Form, Button } from "semantic-ui-react"
import React, { useCallback } from "react"

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
      <Button onClick={onClick} disabled={disabled} loading={loading} >
        Restore from Google
      </Button>
    </Form>
    : null;
}