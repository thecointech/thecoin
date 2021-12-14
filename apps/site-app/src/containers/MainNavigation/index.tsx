import React from 'react';
import { Menu, Dropdown, Icon, SemanticICONS } from 'semantic-ui-react';
import { AccountSwitcher } from '@thecointech/site-base/components/AccountSwitcher';
import { defineMessages, FormattedMessage } from 'react-intl';
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import { NavLink } from 'react-router-dom';
import styles from './styles.module.less';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';

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

const mobileItems = defineMessages({
  home: {
    defaultMessage: 'Overview',
    icon: 'home',
    description: 'app.MainNavigation.home: Title for the entry in the sidebar menu'
  },
  transferin: {
    defaultMessage: 'Top up balance',
    icon: 'arrow circle up',
    description: 'app.MainNavigation.transferin: Title for the entry in the sidebar menu'
  },
  makepayments: {
    defaultMessage: 'Make payments',
    icon: 'arrow circle right',
    description: 'app.MainNavigation.makepayments: Title for the entry in the sidebar menu'
  },
  settings: {
    defaultMessage: 'Settings',
    icon: 'setting',
    description: 'app.MainNavigation.settings: Title for the entry in the sidebar menu'
  },
  contact: {
    defaultMessage: 'Contact Us',
    icon: 'envelope outline',
    description: 'app.MainNavigation.contact: Title for the entry in the sidebar menu'
  }
});

export const MainNavigation = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
  return (
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
          <Menu.Item>
            <Icon name="content" onClick={() => setModalVisible(true)} className={`onlySmallScreen ${styles.burgerIcon}`} />
            <ModalOperation isOpen={modalVisible} closeIconFct={() => setModalVisible(false)}>
              <Menu vertical id={styles.mobileMenu}>
                {Object.entries(mobileItems).map(([key, msg]) =>
                  <Menu.Item as={NavLink} key={key} to={`/${key}`} onClick={() => setModalVisible(false)}>
                    <Icon name={msg.icon as SemanticICONS} size={"big"} className={styles.mobileIcon}/>
                    <FormattedMessage {...msg} />
                  </Menu.Item>
                )}
              </Menu>
            </ModalOperation>
          </Menu.Item>
        </Menu>
      </div>
    </>
  )
};
