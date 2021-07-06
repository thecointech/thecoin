import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import HeaderLink from '@thecointech/site-base/components/HeaderLink';
import {LanguageSwitcher} from '@thecointech/site-base/containers/LanguageSwitcher';
import Logo from './logoAndName.svg';
import styles from './styles.module.less';
import { CreateAccountButton } from '../../../components/AppLinks/CreateAccount';
import { LoginLink } from '../../../components/AppLinks/Login';

const translations = defineMessages({
  home : {
    defaultMessage: 'Home',
    description: 'site.MainNavigation.home: Title for the Home entry in the menu'},
  indepth : {
    defaultMessage: 'In-depth',
    description: 'site.MainNavigation.indepth: Title for the In-depth entry in the menu'},
  wedomore : {
    defaultMessage: 'We do more',
    description: 'site.MainNavigation.wedomore: Title for the We do more entry in the menu'},
  yourbenefits : {
    defaultMessage: 'Your benefits',
    description: 'site.MainNavigation.yourbenefits: Title for the Your benefits entry in the menu'},
  faq : {
    defaultMessage: 'FAQ',
    description: 'site.MainNavigation.faq: Title for the FAQ entry in the menu'},
  blog : {
    defaultMessage: 'Blog',
    description: 'site.MainNavigation.blog: Title for the Blog entry in the menu'}
});

// TODO: Fix Login button
export const MainNavigationGreaterThanMobile = () => {
  return (
    <Container>
        <div className={styles.navContainer} id={styles.mainMenuContainer}>
            <Menu text className={styles.mainMenu} >
              <Menu.Menu position='left'>
                  <Link to="/" id={styles.logoLink}>
                      <img src={Logo} id={styles.logo} />
                  </Link>
                </Menu.Menu>
                <HeaderLink to="/" exact>
                  <FormattedMessage {...translations.home} />
                </HeaderLink>
                <HeaderLink to="/healthier">
                  <FormattedMessage {...translations.indepth} />
                </HeaderLink>
                <HeaderLink to="/wedomore">
                  <FormattedMessage {...translations.wedomore} />
                </HeaderLink>
                <HeaderLink to="/compare">
                  <FormattedMessage {...translations.yourbenefits} />
                </HeaderLink>
                <HeaderLink to="/faq">
                  <FormattedMessage {...translations.faq} />
                </HeaderLink>
                <HeaderLink to="/blog">
                  <FormattedMessage {...translations.blog} />
                </HeaderLink>
                <Menu.Menu position='right'>
                  <Menu.Item>
                    <LoginLink />
                  </Menu.Item>
                  <Menu.Item>
                    <CreateAccountButton />
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
