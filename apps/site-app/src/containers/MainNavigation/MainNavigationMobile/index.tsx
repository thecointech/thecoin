import React from 'react';
import { Menu, Container, Dropdown, Icon, Divider } from 'semantic-ui-react';
import styles from './styles.module.less';
import { AccountSwitcher } from '../../../containers/AccountSwitcher';
import { LanguageSwitcher} from '@the-coin/site-base/containers/LanguageSwitcher';
import { FormattedMessage } from 'react-intl';
import Logo from './logo.svg';
import { NavLink } from 'react-router-dom';

const home = { id:"app.MainNavigation.home",
                defaultMessage:"Home",
                description:"Title for the Home entry in the menu"};
const transferin = { id:"app.MainNavigation.transferin",
                  defaultMessage:"Top up balance",
                  description:"Title for the Top up balance entry in the menu"};
const makepayments = {  id:"app.MainNavigation.makepayments",
                    defaultMessage:"Make payments",
                    description:"Title for the Make payments entry in the menu"};
const settings = {  id:"app.MainNavigation.settings",
                    defaultMessage:"Settings",
                    description:"Title for the Settings entry in the menu"};

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
                  <Dropdown icon='content' className='icon' id={styles.userMenu}>
                    <Dropdown.Menu>
                      <Dropdown.Item as={ NavLink } to='/'>
                        <Icon name="home" /><FormattedMessage {...home} />
                      </Dropdown.Item>
                      <Divider></Divider>
                      <Dropdown.Item as={ NavLink } to='/transfertin'>
                        <Icon name="home" /><FormattedMessage {...transferin} />
                      </Dropdown.Item>
                      <Divider></Divider>
                      <Dropdown.Item as={ NavLink } to='/makepayments'>
                        <Icon name="home" /><FormattedMessage {...makepayments} />
                      </Dropdown.Item>
                      <Divider></Divider>
                      <Dropdown.Item as={ NavLink } to='/settings'>
                        <Icon name="home" /><FormattedMessage {...settings} />
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
