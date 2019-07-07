import { Modal, Loader, Button, Icon } from 'semantic-ui-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

interface OwnProps {
  isOpen: boolean;
  header: FormattedMessage.MessageDescriptor;
  progressPercent?: number;
  progressMessage: FormattedMessage.MessageDescriptor;
  messageValues?: any;
  cancelCallback?: () => void;
  okCallback?: () => void;
}

type Props = OwnProps;

export class ModalOperation extends React.PureComponent<Props, {}, null> {
  constructor(props: Props) {
    super(props);

    this.cancelOperation = this.cancelOperation.bind(this);
  }

  cancelOperation(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (this.props.cancelCallback) this.props.cancelCallback();
  }

  renderCancelButton = (cancelCallback?: () => void) =>
    cancelCallback ? (
      <Button color="red" onClick={this.cancelOperation} inverted>
        <Icon name="cancel" /> Cancel
      </Button>
    ) : (
      undefined
    );

  renderOkButton = (okCallback?: () => void, progressPercent?: number) =>
    okCallback && progressPercent && progressPercent >= 1 ? (
      <Button onClick={okCallback} inverted>
        <Icon name="cancel" /> Ok
      </Button>
    ) : (
      undefined
    );

  renderButtons() {
    const { cancelCallback, okCallback, progressPercent } = this.props;
    return (
      <Modal.Actions>
        {this.renderCancelButton(cancelCallback)}
        {this.renderOkButton(okCallback, progressPercent)}
      </Modal.Actions>
    );
  }

  renderContent = (progressPercent?: number) => (!progressPercent || progressPercent < 1 ? <Loader>{this.renderMessage()}</Loader> : this.renderMessage());

  renderMessage = () => (
    <h3>
      <pre>
        <FormattedMessage
          {...this.props.progressMessage}
          values={{
            percentComplete: this.props.progressPercent,
            ...(this.props.messageValues || {})
          }}
        />
      </pre>
    </h3>
  );

  render() {
    const { isOpen, header, progressPercent } = this.props;
    return (
      <Modal open={isOpen} basic size="small">
        <Modal.Header>
          <FormattedMessage {...header} />
        </Modal.Header>
        <Modal.Content>{this.renderContent(progressPercent)}</Modal.Content>
        {this.renderButtons()}
      </Modal>
    );
  }
}
