import React from 'react';
import { Menu, Container, Dropdown } from 'semantic-ui-react';
import {LanguageSwitcher} from '@thecointech/site-base/containers/LanguageSwitcher';
import { defineMessages, FormattedMessage } from 'react-intl';
import Logo from './logo.svg';
import { Link, NavLink } from 'react-router-dom';
import { LoginLink } from '../../../components/AppLinks/Login';
import styles from './styles.module.less';

const translations = defineMessages({
  home : {
    defaultMessage: 'Home',
    description: 'site.MainNavigationMobile.home: Title for the Home entry in the menu'},
  indepth : {
    defaultMessage: 'In-depth',
    description: 'site.MainNavigationMobile.indepth: Title for the In-depth entry in the menu'},
  wedomore : {
    defaultMessage: 'We do more',
    description: 'site.MainNavigationMobile.wedomore: Title for the We do more entry in the menu'},
  yourbenefits : {
    defaultMessage: 'Your benefits',
    description: 'site.MainNavigationMobile.yourbenefits: Title for the Your benefits entry in the menu'},
  faq : {
    defaultMessage: 'FAQ',
    description: 'site.MainNavigationMobile.faq: Title for the FAQ entry in the menu'},
  blog : {
    defaultMessage: 'FAQ',
    description: 'site.MainNavigationMobile.blog: Title for the Blog entry in the menu'}
});

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
                      <FormattedMessage {...translations.home} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to='/healthier'>
                      <FormattedMessage {...translations.indepth} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to='/wedomore'>
                      <FormattedMessage {...translations.wedomore} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to='/compare'>
                      <FormattedMessage {...translations.yourbenefits} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to="/faq">
                      <FormattedMessage {...translations.faq} />
                    </Dropdown.Item>
                    <Dropdown.Item as={ NavLink } to="/blog">
                      <FormattedMessage {...translations.blog} />
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
