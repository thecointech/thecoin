import { FormattedMessage } from 'react-intl';
import { Color } from 'csstype';
import { ChangeCB, Props as BaseProps } from '../../components/UxInput/types';
import { ReactNode } from 'react';

export type ChangeCB = ChangeCB;

type MyProps = {
  unMaskTime?: number;
}

export type Props = MyProps & BaseProps