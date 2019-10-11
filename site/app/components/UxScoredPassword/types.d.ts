import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Color } from 'csstype';
import { Props as BaseProps } from '@the-coin/components/components/UxPassword/types';
import { InputProps } from 'semantic-ui-react';

export type ChangeCB = (value: string, score: number) => boolean;

// Unfortunately we can't inherit our base props as 
// we are overriding the base uxChange props
export type MyProps = {
  infoBar?: boolean,
  statusColor?: string,
  statusInactiveColor?: string,
  uxChange: ChangeCB,
}

type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type BasePropsR = Without<BaseProps, "uxChange">
export type Props = MyProps & BasePropsR;