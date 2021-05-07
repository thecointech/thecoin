import { MessageDescriptor } from 'react-intl';
import { Props as BaseProps } from '../UxInput/types';

export type ChangeCB = (value: string) => void;

export type Props = {
  unMaskTime?: number;
} & BaseProps;

export const initialState = {
  message: undefined as MessageDescriptor | undefined,
  isPassword: true,
  maskPassword: null,
  selectionStart: 0,
  selectionEnd: 0
}
export type State = Readonly<typeof initialState>;
