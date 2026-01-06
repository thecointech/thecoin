import type { MessageDescriptor } from 'react-intl';
import type { MessageWithValues } from '../../types';
import type { StrictInputProps } from 'semantic-ui-react';
import type { JSX } from 'react';

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

export type ChangeCB<T=string> = (value: T|undefined, name?: string) => void;
//
// Supplied by the client to run validations on the value
// as the user is typing.  Returns an error message in the
// form of a message descriptor, or null if value is valid.
// @param name if name is passed in props, it will be passed to this callback
export type ValidateCB<T=string> = (value: T, name?: string) => Promise<MessageWithValues|null>|MessageWithValues|null;
export type BaseProps<T=string> = {
  // Called once a valid value has been entered
  onValue: ChangeCB<T>;
  // Called each keystroke to validate current data
  onValidate: ValidateCB<T>;

  tooltip?: MessageWithValues;
  placeholder?: MessageDescriptor;

  defaultValue?: T;
  resetToDefault?: number;
  transformDisplayValue?: {
    toDisplay: (value: string) => string;
    toValue: (value: string) => string;
  };
  name?: string;
  forceValidate?: boolean;
  readOnly?: boolean;

  intlLabel?: MessageDescriptor|JSX.Element;
} & StrictInputProps;
