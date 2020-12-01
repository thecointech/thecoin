import React from 'react';
import { Menu, Container, Button } from 'semantic-ui-react';
import { AccountSwitcher } from 'containers/AccountSwitcher';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import HeaderLink from 'components/HeaderLink';

import LanguageSwitcher from 'containers/LanguageSwitcher';

import Logo from './logoAndName.svg';
import styles from './styles.module.css';

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
                    <FormattedMessage id="site.MainNavigation.home"
                      defaultMessage="Home"
                      description="Title for the Home entry in the menu"
                    />
                  </HeaderLink>
                  <HeaderLink to="/healthier">
                    <FormattedMessage id="site.MainNavigation.indepth"
                      defaultMessage="In-depth"
                      description="Title for the In-depth entry in the menu"
                    />
                  </HeaderLink>
                  <HeaderLink to="/wedomore">
                    <FormattedMessage id="site.MainNavigation.wedomore"
                      defaultMessage="We do more"
                      description="Title for the We do more entry in the menu"
                    />
                  </HeaderLink>
                  <HeaderLink to="/compare">
                    <FormattedMessage id="site.MainNavigation.yourbenefits"
                      defaultMessage="Your benefits"
                      description="Title for the Your benefits entry in the menu"
                    />
                  </HeaderLink>
                  <Menu.Menu position='right'>
                    <Menu.Item>
                      <AccountSwitcher />
                    </Menu.Item>
                    <Menu.Item>            
                      <Button as={NavLink} to="/addAccount" content='Create Account' primary />
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
