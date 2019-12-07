import React from 'react';

import { AccountMap } from '@the-coin/components/containers/Account/types';
import { DispatchProps } from '@the-coin/components/containers/Account/actions';
import { UxInput } from '@the-coin/components/components/UxInput';
import { IsValidReferrerId } from '@the-coin/utilities';

import { FormattedMessage } from 'react-intl';
import messages from '../messages';
import { Redirect } from 'react-router-dom';
import { GetReferrersApi } from 'containers/Services/BrokerCAD';

export const initialState = {
  accountName: '',
  accountReferrer: '',

  nameValid: undefined as boolean | undefined,
  nameMessage: undefined as FormattedMessage.MessageDescriptor | undefined,

  referrerValid: undefined as boolean | undefined,
  referrerMessage: undefined as FormattedMessage.MessageDescriptor | undefined,

  forceValidate: false,
  redirect: false,
  isCreating: false,
  cancelCreating: false,
  percentComplete: 0,
};

export type BaseState = Readonly<typeof initialState>;
export type OwnProps = {
  onComplete?: (name: string) => void
}
export type Props = {
  accounts: AccountMap;
} & OwnProps & DispatchProps;

export class NewBaseClass<State extends BaseState> extends React.PureComponent<
  Props,
  State,
  any
> {
  // Validate our inputs
  onNameChange = (value: string) => {
    const validation =
      value.length === 0
        ? {
            nameValid: false,
            nameMessage: messages.errorNameTooShort,
          }
        : this.props.accounts[value]
          ? {
              nameValid: false,
              nameMessage: messages.errorNameDuplicate,
            }
          : {
              nameValid: true,
              nameMessage: undefined,
            };

    this.setState({
      accountName: value,
      ...validation,
    });
  };

  async IsLegalReferrer(id: string) {
    const api = GetReferrersApi()
    // Weird issue: typescript not recognizing the return type
    const isValid: any = await api.referrerValid(id);
    return isValid.success;
  }

  onReferrerChange = async (value: string) => {
    const validation =
      value.length !== 6
        ? {
            referrerValid: false,
            referrerMessage: messages.errorReferrerNumChars,
          }
        : !IsValidReferrerId(value)
          ? {
              referrerValid: false,
              referrerMessage: messages.errorReferrerInvalidCharacters,
            }
          : !(await this.IsLegalReferrer(value))
            ? {
                referrerValid: false,
                referrerMessage: messages.errorReferrerUnknown,
              }
            : {
                referrerValid: true,
                referrerMessage: undefined,
              };
    this.setState({
      accountReferrer: value,
      ...validation,
    });
  };

  async registerReferral(address: string, referrer: string) {
    // Register this account on the server
    const api = GetReferrersApi();
    // Weird typescript hack
    var isRegistered: any = await api.referralCreate({
      newAccount: address,
      referrerId: referrer,
    });

    if (!isRegistered.success) {
      alert(
        'Registering this account failed. Please contact support@thecoin.io',
      );
      return false;
    }
    return true;
  }

  /////////////////////////////////////////////////////////////
  // Render
  RenderNameInput(disabled?: boolean) {
    const { forceValidate, nameValid, nameMessage } = this.state;
    return (
      <UxInput
        uxChange={this.onNameChange}
        intlLabel={messages.labelName}
        forceValidate={forceValidate}
        isValid={nameValid}
        message={nameMessage}
        placeholder="Account Name"
        disabled={disabled}
      />
    );
  }

  RenderReferralInput(disabled?: boolean) {
    const { forceValidate, referrerValid, referrerMessage } = this.state;
    return (
      <UxInput
        uxChange={this.onReferrerChange}
        intlLabel={messages.labelReferrer}
        forceValidate={forceValidate}
        isValid={referrerValid}
        message={referrerMessage}
        placeholder="Referrer"
        disabled={disabled}
      />
    );
  }

  TriggerRedirect() {
    this.setState({
      redirect: true
    })
  }
  ShouldRedirect() {
    return this.state.redirect;
  }
  RenderRedirect() {
    if (this.state.redirect) {
      const addr = `/accounts/e/${this.state.accountName}`;
      return <Redirect to={addr} />;
    }
    return undefined;
  }
}

// // Random key ensures no collisions with named accounts
// const key = '__@create|ee25b960';
// // We need to ensure we have the Accounts reducer live
// // so we add the reducer here.
// export function NewBaseClassHOC<U, T>(impClass: ComponentClass<U, T>)
// {
//   buildReducer<{}>(key)(
//     connect(
//       structuredSelectAccounts,
//       buildMapDispatchToProps(key),
//     )(impClass)
//   );
// }

