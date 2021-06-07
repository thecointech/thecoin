import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import HeaderLink from '@thecointech/site-base/components/HeaderLink';
import {LanguageSwitcher} from '@thecointech/site-base/containers/LanguageSwitcher';
import Logo from './logoAndName.svg';
import styles from './styles.module.less';
import { CreateAccountButton } from '../../../components/AppLinks/CreateAccount';
import { LoginLink } from '../../../components/AppLinks/Login';

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
const faq = {  id:"site.MainNavigation.faq",
                    defaultMessage:"FAQ",
                    description:"Title for the FAQ entry in the menu"};

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
                <HeaderLink to="/faq/theme-0">
                  <FormattedMessage {...faq} />
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
