import React from 'react';
import { Menu, Container, Dropdown } from 'semantic-ui-react';
import styles from './styles.module.css';
import { AccountSwitcher } from 'containers/AccountSwitcher';
import LanguageSwitcher from 'containers/LanguageSwitcher';
import { FormattedMessage } from 'react-intl';
import Logo from './logo.svg';
import { NavLink } from 'react-router-dom';

export class MainNavigationMobile extends React.Component {
  render() {
    return (
      <Container>
          <div className={styles.navContainer} id={styles.mainMenuContainer}>
              <Menu secondary className={ `${styles.mainMenu} x2spaceAfter` } >
                <Menu.Menu position='left'>
                  <div>
                    <img src={Logo} id={styles.logo} className={ `x2spaceBefore` }/>
                  </div>
                </Menu.Menu>
                <Menu.Menu position='right'>
                  <Menu.Item>
                    <AccountSwitcher />
                  </Menu.Item>
                  <Menu.Item>        
                    <LanguageSwitcher />
                  </Menu.Item>
                  <Menu.Item>        
                  <Dropdown icon='content' className='icon'>
                    <Dropdown.Menu>
                      <Dropdown.Item as={ NavLink } to='/'>
                        <FormattedMessage id="site.MainNavigation.home"
                          defaultMessage="Home"
                          description="Title for the Home entry in the menu"
                        /></Dropdown.Item>
                      <Dropdown.Item as={ NavLink } to='/healthier'>
                        <FormattedMessage id="site.MainNavigation.indepth"
                          defaultMessage="In-depth"
                          description="Title for the In-depth entry in the menu"
                        />
                      </Dropdown.Item>
                      <Dropdown.Item as={ NavLink } to='/wedomore'>
                        <FormattedMessage id="site.MainNavigation.wedomore"
                          defaultMessage="We do more"
                          description="Title for the We do more entry in the menu"
                        />
                      </Dropdown.Item>
                      <Dropdown.Item as={ NavLink } to='/compare'>
                        <FormattedMessage id="site.MainNavigation.yourbenefits"
                          defaultMessage="Your benefits"
                          description="Title for the Your benefits entry in the menu"
                        />
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  </Menu.Item>
                </Menu.Menu>
              </Menu>
            </div>
      </Container>   
    );
  }
}
