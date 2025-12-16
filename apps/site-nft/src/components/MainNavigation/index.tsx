import React from 'react';
import { Dropdown, Menu } from 'semantic-ui-react';
import { AccountSwitcher } from '@thecointech/site-base/components/AccountSwitcher';
import { defineMessages, FormattedMessage } from 'react-intl';
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import Logo from './logoAndName.svg';
import styles from './styles.module.less';
import { NavLink } from 'react-router';

const menuItems = defineMessages({
  "": { defaultMessage: "Home", description: "MainNav Home page link" },
  claim: { defaultMessage: "Claim", description: "MainNav page to claim an NFT" },
  profile: { defaultMessage: "Profile", description: "MainNav page to set Profile image on NFT" },
  validate: { defaultMessage: "Validate", description: "MainNav Link to validate page" },
  offsets: { defaultMessage: "Offsets", description: "MainNav Link to offsets page" },
});

export const MainNavigation = () => (
  <>
    <div className={styles.background} />
    <Menu text id={styles.mainMenu}>
      <Menu.Item>
        <a href={process.env.URL_SITE_LANDING} className={styles.logoLink}>
          <img src={Logo} className={styles.logo} />
        </a>
      </Menu.Item>
      {Object.entries(menuItems).map(([key, msg])=>
          <HeaderLink key={key} to={`/${key}`} className="onlyBigScreen">
            <FormattedMessage {...msg} />
          </HeaderLink>
        )}
      <Menu.Menu position='right'>
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
      </Menu.Menu>
    </Menu>
  </>
);
