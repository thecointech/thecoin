import { Modal, Loader, Button, Icon } from 'semantic-ui-react';
import * as React from 'react';
import { MessageDescriptor, FormattedMessage } from 'react-intl';

interface OwnProps {
  isOpen: boolean;
  header?: MessageDescriptor;
  progressPercent?: number;
  progressMessage?: MessageDescriptor;
  messageValues?: any;
  closeIcon?: boolean;
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
      <Button onClick={okCallback} inverted primary>
        <Icon />OK
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

  renderContent = (progressPercent?: number) => (progressPercent || (progressPercent! < 1) ? <Loader>{this.renderMessage()}</Loader> : this.renderMessage());

  renderProgress = () => (
    <h3>
      <FormattedMessage
        {...this.props.progressMessage!}
        values={{
          percentComplete: this.props.progressPercent,
          ...(this.props.messageValues || {})
        }}
      />
    </h3>
  );

  renderMessage = () => (
    this.props.progressMessage ? 
      this.renderProgress() :
      this.props.children
  );

  render() {
    const { isOpen, header, closeIcon, progressPercent } = this.props;
    const headerContent = header ? <Modal.Header><FormattedMessage {...header} /></Modal.Header> : "";
    const closeContent = closeIcon ? <Icon name="close" size="large" /> : "";
    return (
      <Modal open={isOpen} basic size="small">
        {closeContent}
        {headerContent}
        <Modal.Content>{this.renderContent(progressPercent)}</Modal.Content>
        {this.renderButtons()}
      </Modal>
    );
  }
}
