import React, { useState } from 'react';
import { Container, Icon } from 'semantic-ui-react';
import { UxInput } from '../UxInput';
import { Props } from '../UxInput/types';
import styles from './styles.module.less';

const UnMasked = "text";
const Masked = "password";
const hideStyle: React.CSSProperties = {
  display: 'none',
};
const showStyle: React.CSSProperties = {
  display: 'block',
}

export const UxPassword = (props: Props) => {

  // Show/hide toggle for pwd
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(val => !val);
  return (
    <Container id={styles.containerPasswordField}>
      <div onClick={togglePassword} id={styles.togglePassword} unselectable="on">
        <p style={showPassword ? showStyle : hideStyle}><Icon name='hide' />&nbsp;Show Password</p>
        <p style={showPassword ? hideStyle : showStyle}><Icon name='unhide' />&nbsp;Hide Password</p>
      </div>
      <UxInput
        type={showPassword ? Masked : UnMasked}
        {...props}
      />
    </Container>
  )
}
