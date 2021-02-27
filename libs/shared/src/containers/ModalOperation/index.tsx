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

export const ModalOperation : React.FC = (props, propsModal:Props) => {

  function cancelOperation(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (propsModal.cancelCallback) propsModal.cancelCallback();
  }

  function renderCancelButton(cancelCallback?: () => void){
    return (
      cancelCallback ? (
        <Button color="red" onClick={cancelOperation} inverted>
          <Icon name="cancel" /> Cancel
        </Button>
      ) : (undefined)
    );
  }

  function renderOkButton(okCallback?: () => void, progressPercent?: number) {
    okCallback && progressPercent && progressPercent >= 1 ? (
      <Button onClick={okCallback} inverted primary>
        <Icon />OK
      </Button>
    ) : (
      undefined
    );
  }

  function renderButtons() {
    const { cancelCallback, okCallback, progressPercent } = propsModal;
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
          {...propsModal.progressMessage!}
          values={{
            percentComplete: propsModal.progressPercent,
            ...(propsModal.messageValues || {})
          }}
        />
      </h3>);
  }

  function renderMessage(){
    return propsModal.progressMessage ? renderProgress() : props.children
  }

  const { isOpen, header, closeIcon, progressPercent } = propsModal;
  const headerContent = header ? <Modal.Header><FormattedMessage {...header} /></Modal.Header> : "";
  const closeContent = closeIcon ? <Icon name="close" size="large" /> : "";
  return (
    <Modal open={isOpen} basic size="small">
      {closeContent}
      {headerContent}
      <Modal.Content>{renderContent(progressPercent)}</Modal.Content>
      {renderButtons()}
    </Modal>
  );
  
}
