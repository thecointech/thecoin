import React, { Dispatch, SetStateAction } from 'react'
import { useIntl, defineMessage } from 'react-intl';
import { Checkbox, CheckboxProps } from 'semantic-ui-react';
import { Options } from '../types';

const toggleFrame = defineMessage({ defaultMessage: "Frame", description: "Profile option to overlay TC border" });
const toggleYears = defineMessage({ defaultMessage: "Years", description: "Profile option to overlay years of neutrality" });
const toggleID = defineMessage({ defaultMessage: "Token ID", description: "Profile toggle option years of neutrality" });

type Props = {
  state: Options,
  setState: Dispatch<SetStateAction<Options>>;
}

export const OptionToggles = ({state, setState}: Props) => {
  const intl = useIntl();
  const toggle = (_: unknown, data: CheckboxProps) => {
    setState(opt => ({
      ...opt,
      [data.name!]: data.checked,
    }))
  }
  return (
    <div>
      <Checkbox toggle name='showFrame' label={intl.formatMessage(toggleFrame)} checked={state.showFrame} onChange={toggle} />
      <Checkbox toggle name='showYears' label={intl.formatMessage(toggleYears)} checked={state.showYears} onChange={toggle} />
      <Checkbox toggle name='showTokenId' label={intl.formatMessage(toggleID)}  checked={state.showTokenId} onChange={toggle} />
    </div>
  );
}
