import React from 'react';
import { Menu, Dropdown } from 'semantic-ui-react';
import { AccountSwitcher } from '@thecointech/site-base/components/AccountSwitcher';
import { defineMessages, FormattedMessage } from 'react-intl';
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import { NavLink } from 'react-router-dom';
import Logo from './logoAndName.svg';
import styles from './styles.module.less';

const menuItems = defineMessages({
  home: {
    defaultMessage: 'Home',
    description: 'app.MainNavigation.home: Title for the Home entry in the menu'
  },
  help: {
    defaultMessage: 'Help',
    description: 'app.MainNavigation.help: Title for the help entry in the menu'
  },
  contact: {
    defaultMessage: 'Contact Us',
    description: 'app.MainNavigation.contact: Title for the contact us entry in the menu'
  }
});

export const MainNavigation = () => (
  <>
    <div className={styles.background} />
    <div className={styles.mainMenu}>
      <Menu text className={styles.mainMenu} >
        <Menu.Item>
          <a href={process.env.URL_SITE_LANDING} className={styles.logoLink}>
            <div className={styles.logo} />
          </a>
        </Menu.Item>
        <HeaderLink to="/" exact className="onlyBigScreen">
          <FormattedMessage {...menuItems.home} />
        </HeaderLink>
        <HeaderLink to="/help" exact>
          <FormattedMessage {...menuItems.help} />
        </HeaderLink>
        <HeaderLink to="/contact" exact className="onlyBigScreen">
          <FormattedMessage {...menuItems.contact} />
        </HeaderLink>
      </Menu>
      <Menu text>
        <Menu.Item>
          <AccountSwitcher />
        </Menu.Item>
        <Menu.Item>
          <LanguageSwitcher />
        </Menu.Item>
        <Menu.Item className={`onlySmallScreen ${styles.burgerMenu}`}>
          <Dropdown icon='content' direction="left" className='icon'>
            <Dropdown.Menu>
              {Object.entries(menuItems).map(([key, msg]) =>
                <Dropdown.Item as={NavLink} key={key} to={`/${key}`}>
                  <FormattedMessage {...msg} />
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
      </Menu>
    </div>
  </>
);
