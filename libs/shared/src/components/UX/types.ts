import type { MessageDescriptor } from 'react-intl';
import type { MessageWithValues } from '../../types';
import type { StrictInputProps } from 'semantic-ui-react';

export type SomeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export const initialState = {
  value: '',
  showState: false,
};


export enum ErrorState {
  Initial,
  Error,
  Success,
  Warning,
}

export type ChangeCB = (value: string|undefined, name?: string) => void;
//
// Supplied by the client to run validations on the value
// as the user is typing.  Returns an error message in the
// form of a message descriptor, or null if value is valid.
// @param name if name is passed in props, it will be passed to this callback
export type ValidateCB = (value: string, name?: string) => MessageDescriptor|null;
export type BaseProps = {
  // Called once a valid value has been entered
  onValue: ChangeCB;
  // Called each keystroke to validate current data
  onValidate: ValidateCB;

  tooltip: MessageWithValues;
  placeholder: MessageDescriptor;

  defaultValue?: string;
  name?: string;
  forceValidate?: boolean;
  readOnly?: boolean;

  intlLabel: MessageDescriptor|JSX.Element;
} & StrictInputProps;
