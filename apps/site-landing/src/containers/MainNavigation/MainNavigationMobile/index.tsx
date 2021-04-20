import React from 'react';
import { Menu, Container, Dropdown } from 'semantic-ui-react';
import {LanguageSwitcher} from '@thecointech/site-base/containers/LanguageSwitcher';
import { FormattedMessage } from 'react-intl';
import Logo from './logo.svg';
import { Link, NavLink } from 'react-router-dom';
import { LoginLink } from 'components/AppLinks/Login';
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


export const MainNavigationMobile = () => {
  return (
    <Container>
        <div className={styles.navContainer} id={styles.mainMenuContainer}>
            <Menu secondary className={ `${styles.mainMenu} x2spaceAfter` } >
              <Menu.Menu position='left'>
                <Link to="/" id={styles.logoLink}>
                  <img src={Logo} id={styles.logo} className={ `x2spaceBefore` }/>
                </Link>
              </Menu.Menu>
              <Menu.Menu position='right'>
                <Menu.Item>
                  <LoginLink />
                </Menu.Item>
                <Menu.Item>
                  <LanguageSwitcher />
                </Menu.Item>
                <Menu.Item>
                <Dropdown icon='content' className='icon'>
                  <Dropdown.Menu>
                    <Dropdown.Item as={ NavLink } to='/'>
                      <FormattedMessage {...home} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to='/healthier'>
                      <FormattedMessage {...indepth} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to='/wedomore'>
                      <FormattedMessage {...wedomore} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to='/compare'>
                      <FormattedMessage {...yourbenefits} />
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
