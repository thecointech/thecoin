import { Modal, Loader, Button, Icon } from 'semantic-ui-react';
import * as React from 'react';
import { MessageDescriptor, FormattedMessage, defineMessages } from 'react-intl';
import { MessageWithValues } from '../../types';

interface ModalProps {
  isOpen: boolean;
  header?: MessageDescriptor;
  progressPercent?: number;
  progressMessage?: MessageWithValues;
  closeIconFct?: (value:string) => void;
  cancelCallback?: () => void;
  okCallback?: () => void;
}

const translate = defineMessages({
  ok : {
    defaultMessage:"Ok",
    description:"shared.modalOperation.ok: Text for the ok button for the modal tool"},
  cancel : {
    defaultMessage:"Cancel",
    description:"shared.modalOperation.cancel: Text for the cancel button for the modal tool"}});

export const ModalOperation : React.FC<ModalProps> = (props) => {

  function cancelOperation(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (props.cancelCallback) props.cancelCallback();
  }

  function renderCancelButton(cancelCallback?: () => void){
    return (
      cancelCallback ? (
        <Button color="red" onClick={cancelOperation} inverted>
          <Icon name="cancel" /> <FormattedMessage {...translate.cancel} />
        </Button>
      ) : (undefined)
    );
  }

  function renderOkButton(okCallback?: () => void, progressPercent?: number) {
    okCallback && progressPercent && progressPercent >= 1 ? (
      <Button onClick={okCallback} inverted primary>
        <Icon /><FormattedMessage {...translate.ok} />
      </Button>
    ) : (
      undefined
    );
  }

  function renderButtons() {
    const { cancelCallback, okCallback, progressPercent } = props;
    return (
      <Modal.Actions>
        {renderCancelButton(cancelCallback)}
        {renderOkButton(okCallback, progressPercent)}
      </Modal.Actions>
    );
  }

  function renderContent(progressPercent?: number) {
    return (progressPercent || (progressPercent! < 1) ? <Loader>{renderMessage()}</Loader> : renderMessage());
  }

  function renderProgress() {
   return (
      <h3>
        <FormattedMessage
          {...props.progressMessage!}
          values={{
            percentComplete: props.progressPercent,
            ...(props.progressMessage?.values || {})
          }}
        />
      </h3>);
  }

  function renderMessage(){
    return props.progressMessage ? renderProgress() : props.children
  }

  const { isOpen, header, closeIconFct, progressPercent } = props;
  const headerContent = header ? <Modal.Header><FormattedMessage {...header} /></Modal.Header> : "";
  const closeContent = closeIconFct ? <Icon name="close" size="large" onClick={closeIconFct}/> : "";
  return (
    <Modal open={isOpen} basic size="small">
      {closeContent}
      {headerContent}
      <Modal.Content>{renderContent(progressPercent)}</Modal.Content>
      {renderButtons()}
    </Modal>
  );

}
