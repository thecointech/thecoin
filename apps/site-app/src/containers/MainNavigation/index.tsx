import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { AccountSwitcher } from '@thecointech/site-base/components/AccountSwitcher';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import { NavLink } from '@thecointech/shared/components/Links';
import styles from './styles.module.less';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { SidebarItemsReducer } from '@thecointech/shared/containers/PageSidebar';

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

export const MainNavigation = () => {
  return (
    <>
      <div className={styles.background} />
      <div className={styles.mainMenu}>
        <LeftMenuItems />
        <RightMenuItems />
      </div>
    </>
  )
};

const LeftMenuItems = () => (
  <Menu text className={styles.mainMenu} >
    <Menu.Item style={{marginLeft: 0}}>
      <a href={process.env.URL_SITE_LANDING} className={styles.logoLink}>
        <div className={styles.logo} />
      </a>
    </Menu.Item>
    <HeaderLink to="/" className="onlyBigScreen">
      <FormattedMessage {...menuItems.home} />
    </HeaderLink>
    <HeaderLink as="a" href={`${process.env.URL_SITE_LANDING}/#/help`}>
      <FormattedMessage {...menuItems.help} />
    </HeaderLink>
    <HeaderLink to="/contact" className="onlyBigScreen">
      <FormattedMessage {...menuItems.contact} />
    </HeaderLink>
  </Menu>
)

const RightMenuItems = () => {
  // Mirror the sidebar menu items in our burger menu
  const [modalVisible, setModalVisible] = React.useState(false);
  const sidebarData = SidebarItemsReducer.useData();
  const intl = useIntl();
  return (
    <Menu text>
      <Menu.Item>
        <AccountSwitcher />
      </Menu.Item>
      <Menu.Item>
        <LanguageSwitcher />
      </Menu.Item>
      <Menu.Item className="onlySmallScreen">
        <Icon name="content" onClick={() => setModalVisible(true)} className={styles.burgerIcon} />
        <ModalOperation isOpen={modalVisible} closeIconFct={() => setModalVisible(false)}>
          <Menu vertical id={styles.mobileMenu}>
            {Object.entries(sidebarData.items.links).map(([key, link]) =>
              <Menu.Item as={NavLink} key={key} to={link.to} exact onClick={() => setModalVisible(false)}>
                <Icon name={link.icon} size={"big"} className={styles.mobileIcon} />
                {intl.formatMessage(link.name)}
              </Menu.Item>
            )}
          </Menu>
        </ModalOperation>
      </Menu.Item>
    </Menu>
  )
}
