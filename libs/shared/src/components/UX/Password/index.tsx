import React, { useState } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Container, Icon } from 'semantic-ui-react';
import { UxInput } from '../Input';
import type { BaseProps, SomeOptional } from '../types';
import styles from './styles.module.less';

const UnMasked = "text";
const Masked = "password";
const hideStyle: React.CSSProperties = {
  display: 'none',
};
const showStyle: React.CSSProperties = {
  display: 'block',
}

const showLabel = defineMessage({defaultMessage: "Show Password", description: "Label for toggle showing password in input"})
const hideLabel = defineMessage({defaultMessage: "Hide Password", description: "Label for toggle hiding password in input"})
const enterPassword = defineMessage({defaultMessage: "Please enter your password", description: "Popup error message if no password entered before submit"})
const noValidation = (val: string) => val.length == 0 ? enterPassword : null;

type Props = SomeOptional<BaseProps, "defaultValue"|"onValidate">
export const UxPassword = (props: Props) => {
  const { onValidate, defaultValue, ...rest } = props;
  // Show/hide toggle for pwd
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(val => !val);
  return (
    <Container id={styles.containerPasswordField}>
      <div onClick={togglePassword} id={styles.togglePassword} unselectable="on">
        <p style={showPassword ? hideStyle : showStyle}><Icon name='hide' />&nbsp;<FormattedMessage {...showLabel} /></p>
        <p style={showPassword ? showStyle : hideStyle}><Icon name='unhide' />&nbsp;<FormattedMessage {...hideLabel} /></p>
      </div>
      <UxInput
        type={showPassword ? UnMasked : Masked}
        onValidate={onValidate ?? noValidation}
        {...rest}
      />
    </Container>
  )
}
