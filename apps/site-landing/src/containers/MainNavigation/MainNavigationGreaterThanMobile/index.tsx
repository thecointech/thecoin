import React from 'react';
import { Dropdown, Menu } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link, NavLink } from 'react-router-dom';
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import styles from './styles.module.less';
import { CreateAccountButton } from '../../../components/AppLinks/CreateAccount';
import { LoginLink } from '../../../components/AppLinks/Login';

const menuItems = defineMessages({
  healthier: {
    defaultMessage: 'In-depth',
    description: 'site.MainNavigation.indepth: Title for the In-depth entry in the menu'
  },
  wedomore: {
    defaultMessage: 'We do more',
    description: 'site.MainNavigation.wedomore: Title for the We do more entry in the menu'
  },
  compare: {
    defaultMessage: 'Your benefits',
    description: 'site.MainNavigation.yourbenefits: Title for the Your benefits entry in the menu'
  },
  help: {
    defaultMessage: 'Help',
    description: 'site.MainNavigation.faq: Help Link'
  },
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
    <div className={styles.navContainer}>
      <Menu.Menu>
        <Link to="/" className={styles.logoLink}>
          <div className={styles.logo} />
        </Link>
        {Object.entries(menuItems).map(([key, msg])=>
          <HeaderLink key={key} to={`/${key}`} className="onlyBigScreen">
            <FormattedMessage {...msg}>
              {replaceSpaces}
            </FormattedMessage>
          </HeaderLink>
        )}
      </Menu.Menu>
      <Menu.Menu position="right" className={styles.menuRight}>
        <LoginLink />
        <Menu.Item className={`${styles.createButton} onlyBigScreen`}>
          <CreateAccountButton />
        </Menu.Item>
        <Menu.Item>
          <LanguageSwitcher />
        </Menu.Item>
        <Menu.Item className='onlySmallScreen'>
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
    </div>
  );
}
