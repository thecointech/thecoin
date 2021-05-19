import { Modal, Loader, Button, Icon } from 'semantic-ui-react';
import * as React from 'react';
import { MessageDescriptor, FormattedMessage } from 'react-intl';

interface ModalProps {
  isOpen: boolean;
  header?: MessageDescriptor;
  progressPercent?: number;
  progressMessage?: MessageDescriptor;
  messageValues?: any;
  closeIcon?: boolean;
  closeIconFct?: (value:string) => void;
  cancelCallback?: () => void;
  okCallback?: () => void;
}

const ok = { id:"shared.modalOperation.ok",
                defaultMessage:"Ok",
                description:"Text for the ok button for the modal tool"};
const cancel = { id:"shared.modalOperation.cancel",
                defaultMessage:"Cancel",
                description:"Text for the cancel button for the modal tool"};

export const ModalOperation : React.FC<ModalProps> = (props) => {

  function cancelOperation(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (props.cancelCallback) props.cancelCallback();
  }

  function renderCancelButton(cancelCallback?: () => void){
    return (
      cancelCallback ? (
        <Button color="red" onClick={cancelOperation} inverted>
          <Icon name="cancel" /> <FormattedMessage {...cancel} />
        </Button>
      ) : (undefined)
    );
  }

  function renderOkButton(okCallback?: () => void, progressPercent?: number) {
    okCallback && progressPercent && progressPercent >= 1 ? (
      <Button onClick={okCallback} inverted primary>
        <Icon /><FormattedMessage {...ok} />
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
            ...(props.messageValues || {})
          }}
        />
      </h3>);
  }

  function renderMessage(){
    return props.progressMessage ? renderProgress() : props.children
  }

  const { isOpen, header, closeIcon, closeIconFct, progressPercent } = props;
  const headerContent = header ? <Modal.Header><FormattedMessage {...header} /></Modal.Header> : "";
  const closeContent = closeIcon ? <Icon name="close" size="large" onClick={closeIconFct}/> : "";
  return (
    <Modal open={isOpen} basic size="small">
      {closeContent}
      {headerContent}
      <Modal.Content>{renderContent(progressPercent)}</Modal.Content>
      {renderButtons()}
    </Modal>
  );
  
}
