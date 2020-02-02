import { Form, Button } from "semantic-ui-react"
import React from "react"

type Props = {
  disabled: boolean,
  isVisible: boolean;
  onClick: () => void;
}
export const ConnectButton = (props: Props) =>
  props.isVisible
    ? <Form>
      <Button {...props}>
        Restore from Google
      </Button>
    </Form>
    : null;
