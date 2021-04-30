import { Props as BaseProps } from '@thecointech/shared/components/UxPassword/types';
import { UxOnChange } from '../../../../shared/build/components/UxInput/types';

// Unfortunately we can't inherit our base props as
// we are overriding the base uxChange props
export type MyProps = {
  infoBar?: boolean,
  statusColor?: string,
  statusInactiveColor?: string,
  uxChange: (e:UxOnChange, score: number) => boolean,
}

type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type BasePropsR = Without<BaseProps, "uxChange">
export type Props = MyProps & BasePropsR;
