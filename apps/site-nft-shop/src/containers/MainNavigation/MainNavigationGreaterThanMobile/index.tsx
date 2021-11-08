import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';

import HeaderLink from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher} from '@thecointech/site-base/containers/LanguageSwitcher';

import Logo from './images/logoAndName.svg';
import styles from './styles.module.less';

const translations = defineMessages({
  home : {
      defaultMessage: 'Home',
      description: 'app.MainNavigation.home: Title for the Home entry in the menu'},
  help : {
      defaultMessage: 'Help',
      description: 'app.MainNavigation.help: Title for the help entry in the menu'},
  contact : {
      defaultMessage: 'Contact Us',
      description: 'app.MainNavigation.contact: Title for the contact us entry in the menu'}
});

  export const MainNavigationGreaterThanMobile = () => {
    return (
      <Container>
          <div className={styles.navContainer} id={styles.mainMenuContainer}>
              <Menu text className={styles.mainMenu} >
                <Menu.Menu position='left'>
                    <div>
                      <a href={process.env.URL_SITE_LANDING} id={styles.logoLink}>
                        <img src={Logo} id={styles.logo} />
                      </a>
                    </div>
                  </Menu.Menu>
                  <HeaderLink to="/" exact>
                    <FormattedMessage {...translations.home} />
                  </HeaderLink>
                  {/* <HeaderLink to="/" exact>
                    <FormattedMessage {...help} />
                  </HeaderLink>*/}
                  <HeaderLink to="/contact" exact>
                    <FormattedMessage {...translations.contact} />
                  </HeaderLink>
                  <Menu.Menu position='right'>
                    <Menu.Item>
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
