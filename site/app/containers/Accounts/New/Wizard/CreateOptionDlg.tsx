import React from 'react';
import { ModalOperation } from '@the-coin/components/containers/ModalOperation';
import { FormattedMessage } from 'react-intl';
import { Option } from './Options/Types';
// import Cookies from 'js-cookie'
import { withRouter, RouteComponentProps } from 'react-router-dom';


interface MyProps {
  option: Option;
  onCancel: () => void;
}
type Props = MyProps & RouteComponentProps;

export const CreateOptionDlg = withRouter((props: Props) => {

  const {option, onCancel} = props;
  const {messages} = option;

  const onOk = () => {
    // Cookies.set('createOptions', props.option, { expires: 7 });
    const {messages, ...optsNoMessage } = props.option;
    const urlOpt = encodeURI(JSON.stringify(optsNoMessage));
    props.history.push(`/accounts/create?options=${urlOpt}`);
  };

  return (
    <ModalOperation
      cancelCallback={onCancel}
      okCallback={onOk}
      isOpen={true}
      header={messages.header}
      progressPercent={1}
    >
      <p><FormattedMessage {...messages.description}/></p>
      <p>Auth: <FormattedMessage {...messages.auth}/></p>
      <p>Pros: <FormattedMessage {...messages.pros}/></p>
      <p>Cons: <FormattedMessage {...messages.cons}/></p>
    </ModalOperation>
  );
});
