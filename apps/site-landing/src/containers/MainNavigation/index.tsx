import React from 'react';
import { Icon, Menu, SemanticICONS } from 'semantic-ui-react';
import { defineMessage, defineMessages, FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router';
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import { CreateAccountButton } from '../../components/AppLinks/CreateAccount';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import styles from './styles.module.less';

const menuItems = defineMessages({
  healthier: {
    defaultMessage: 'In-depth',
    description: 'site.MainNavigation.indepth: Title for the In-depth entry in the menu',
    icon: "magnify"
  },
  wedomore: {
    defaultMessage: 'We do more',
    description: 'site.MainNavigation.wedomore: Title for the We do more entry in the menu',
    icon: "plus",
  },
  compare: {
    defaultMessage: 'Your benefits',
    description: 'site.MainNavigation.yourbenefits: Title for the Your benefits entry in the menu',
    icon: "arrow up",
  },
  blog: {
    defaultMessage: 'Blog',
    description: 'site.MainNavigation.blog: Blog Link',
    icon: "newspaper"
  },
  help: {
    defaultMessage: 'Help',
    description: 'site.MainNavigation.faq: Help Link',
    icon: "question"
  },
});

const loginLink = defineMessage({
  defaultMessage: 'LOG IN',
  description: 'site.MainNavigation.loginLink: Button to log in in app'
});

// We want our text to wrap on the first word break only
const replaceSpaces = (chunks:  React.ReactNode) => (
  <>{chunks?.toString()
    .replace(/\s/g, '\xa0') // replace all spaces with nbsp
    .replace('\xa0', ' ') // set first nbsp back to space (break here)
  }</>
)

export const MainNavigation = () => {
  return (
    <>
      <div className={styles.background} />
      <div id={styles.mainMenu}>
        <LeftMenuItems />
        <RightMenuItems />
      </div>
    </>
  )
};

const LeftMenuItems = () => (
  <Menu text className={styles.leftMenu}>
      <NavLink to="/" className={styles.logoLink} viewTransition>
        <div className={styles.logo} />
      </NavLink>
    {Object.entries(menuItems).map(([key, msg]) =>
      <HeaderLink key={key} to={`/${key}`} className="onlyBigScreen">
        <FormattedMessage {...msg}>
          {replaceSpaces}
        </FormattedMessage>
      </HeaderLink>
    )}
  </Menu>
)

const RightMenuItems = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <Menu text>
    <HeaderLink<React.HTMLProps<HTMLAnchorElement>> as="a" href={process.env.URL_SITE_APP ?? "/AppLogin"} target="_blank">
      <FormattedMessage {...loginLink} />
    </HeaderLink>
    <Menu.Item className={`${styles.createButton} onlyBigScreen`}>
      <CreateAccountButton />
    </Menu.Item>
    <Menu.Item>
      <LanguageSwitcher />
    </Menu.Item>
    <Menu.Item className="onlySmallScreen">
      <Icon name="content" onClick={() => setModalVisible(true)} className={styles.burgerIcon} />
      <ModalOperation isOpen={modalVisible} closeIconFct={() => setModalVisible(false)}>
      <Menu vertical id={styles.mobileMenu}>
          {Object.entries(menuItems).map(([key, msg]) =>
            <Menu.Item as={NavLink} key={key} to={`/${key}`} onClick={() => setModalVisible(false)}>
              <Icon name={msg.icon as SemanticICONS} size={"big"} className={styles.mobileIcon} />
              <FormattedMessage {...msg} />
            </Menu.Item>
          )}
        </Menu>
      </ModalOperation>
    </Menu.Item>
  </Menu>
  )
}
