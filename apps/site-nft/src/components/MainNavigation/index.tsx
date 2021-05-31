import React from 'react';
import { Menu } from 'semantic-ui-react';
import { AccountSwitcher } from '../AccountSwitcher';
import { defineMessages, FormattedMessage } from 'react-intl';
import HeaderLink from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import Logo from './images/logoAndName.svg';
import styles from './styles.module.less';

const messages = defineMessages({
  home: { defaultMessage: "Home", description: "MainNav Home page link" },
  claim: { defaultMessage: "Claim", description: "MainNav page to claim an NFT" },
  profile: { defaultMessage: "Profile", description: "MainNav page to set Profile image on NFT" }
});

export const MainNavigation = () => (
  <>
    <div className={styles.background} />
    <Menu text id={styles.mainMenu}>
      <Menu.Item>
        <div>
          <a href={process.env.URL_SITE_LANDING} id={styles.logoLink}>
            <img src={Logo} id={styles.logo} />
          </a>
        </div>
      </Menu.Item>
      <HeaderLink to="/" exact>
        <FormattedMessage defaultMessage="Home" description="MainNav asd Home page link" />
      </HeaderLink>
      <HeaderLink to="/claim" exact>
        <FormattedMessage {...messages.claim} />
      </HeaderLink>
      <HeaderLink to="/profile" exact>
        <FormattedMessage {...messages.profile} />
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
  </>
);
