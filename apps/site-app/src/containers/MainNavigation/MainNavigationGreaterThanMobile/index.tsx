import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import { AccountSwitcher } from '../../../containers/AccountSwitcher';
import { FormattedMessage } from 'react-intl';

import HeaderLink from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher} from '@thecointech/site-base/containers/LanguageSwitcher';

import Logo from './logoAndName.svg';
import styles from './styles.module.less';

const home = { id:"app.MainNavigation.home",
                defaultMessage:"Home",
                description:"Title for the Home entry in the menu"};
const help = { id:"app.MainNavigation.help",
                defaultMessage:"Help",
                description:"Title for the help entry in the menu"};
const contact = { id:"app.MainNavigation.contact",
                defaultMessage:"Contact Us",
                description:"Title for the contact entry in the menu"};

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
                    <FormattedMessage {...home} />
                  </HeaderLink>
                  {/* <HeaderLink to="/" exact>
                    <FormattedMessage {...help} />
                  </HeaderLink>*/}
                  <HeaderLink to="/contact" exact>
                    <FormattedMessage {...contact} />
                  </HeaderLink>
                  <Menu.Menu position='right'>
                    <Menu.Item>
                      <AccountSwitcher />
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
