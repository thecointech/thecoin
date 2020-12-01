import React from 'react';
import { Menu, Container, Button } from 'semantic-ui-react';
import { AccountSwitcher } from 'containers/AccountSwitcher';
import { FormattedMessage, useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import HeaderLink from 'components/HeaderLink';

import LanguageSwitcher from 'containers/LanguageSwitcher';

import Logo from './logoAndName.svg';
import styles from './styles.module.less';

const home = { id:"site.MainNavigation.home", 
                defaultMessage:"Home",
                description:"Title for the Home entry in the menu"};
const indepth = { id:"site.MainNavigation.indepth", 
                  defaultMessage:"In-depth",
                  description:"Title for the In-depth entry in the menu"};
const wedomore = {  id:"site.MainNavigation.wedomore", 
                    defaultMessage:"We do more",
                    description:"Title for the We do more entry in the menu"};
const yourbenefits = {  id:"site.MainNavigation.yourbenefits", 
                    defaultMessage:"Your benefits",
                    description:"Title for the Your benefits entry in the menu"};
const titleButton = { id: 'site.MainNavigation.button,createAccount', defaultMessage:'Create Account'};


export class MainNavigationGreaterThanMobile extends React.Component {

  render() {
    return (
      <Container>
          <div className={styles.navContainer} id={styles.mainMenuContainer}>
              <Menu secondary className={styles.mainMenu} >
                <Menu.Menu position='left'>
                    <div>
                      <img src={Logo} id="logo"/>
                    </div>
                  </Menu.Menu>
                  <HeaderLink to="/" exact>
                    <FormattedMessage {...home} />
                  </HeaderLink>
                  <HeaderLink to="/healthier">
                    <FormattedMessage {...indepth} />
                  </HeaderLink>
                  <HeaderLink to="/wedomore">
                    <FormattedMessage {...wedomore} />
                  </HeaderLink>
                  <HeaderLink to="/compare">
                    <FormattedMessage {...yourbenefits} />
                  </HeaderLink>
                  <Menu.Menu position='right'>
                    <Menu.Item>
                      <AccountSwitcher />
                    </Menu.Item>
                    <Menu.Item>            
                      <Button as={NavLink} to="/addAccount" primary >
                          <FormattedMessage {...titleButton} />
                      </Button>
                    </Menu.Item>
                    <Menu.Item>
                      <LanguageSwitcher />
                    </Menu.Item>
                  </Menu.Menu>
              </Menu>
          </div>
      </Container>
    );
  }
}
