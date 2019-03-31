import { Modal, Loader, Button, Icon } from "semantic-ui-react";
import * as React from 'react';
import { FormattedMessage } from "react-intl";

interface OwnProps {
  isOpen: boolean;
  header: FormattedMessage.MessageDescriptor;
  progressPercent?: number;
  progressMessage: FormattedMessage.MessageDescriptor;
  cancelCallback?: () => void;
}

type Props = OwnProps;

export class CancellableOperationModal extends React.PureComponent<Props, {}, null> {

  constructor(props: Props) {
    super(props);

    this.cancelOperation = this.cancelOperation.bind(this);
  }

  cancelOperation(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    this.props.cancelCallback();
  }

  render() {
    const {isOpen, header, progressMessage, progressPercent, cancelCallback } = this.props;

    const actions = cancelCallback ? (
      <Modal.Actions>
        <Button color="red" onClick={this.cancelOperation} inverted>
          <Icon name="cancel" /> Cancel
        </Button>
      </Modal.Actions>
    ) : undefined;

    return (
      <Modal open={isOpen} basic size="small">
      <Modal.Header>
        <FormattedMessage {...header} />
      </Modal.Header>
      <Modal.Content>
        <Loader>
          <h3>
            <FormattedMessage {...progressMessage} 
              values={{
                percentComplete: progressPercent
              }}/>
          </h3>
        </Loader>
      </Modal.Content>
      {actions}
    </Modal>
    );
  }
}