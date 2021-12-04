import React from 'react';
import { Menu } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { HeaderLink } from '@thecointech/site-base/components/HeaderLink';
import { LanguageSwitcher } from '@thecointech/site-base/containers/LanguageSwitcher';
import type { AllRoutes } from "../App/Routes"
import styles from './styles.module.less';
import { AccountSwitcher } from '../AccountSwitcher';
import Logo from './logoAndName.svg'

// Typescript here is used to enforce that all our entries match actual routes.
type MainRoutes = Extract<AllRoutes, "home"|"contact">
const menuItems = defineMessages<MainRoutes>({
  home : {
      defaultMessage: 'Home',
      description: 'app.MainNavigation.home: Title for the Home entry in the menu'},
  // help : {
  //     defaultMessage: 'Help',
  //     description: 'app.MainNavigation.help: Title for the help entry in the menu'},
  contact : {
      defaultMessage: 'Contact Us',
      description: 'app.MainNavigation.contact: Title for the contact us entry in the menu'}
});

export const MainNavigation = () => {
  return (
    <div className={styles.navContainer}>
      <Menu.Menu>
        <a href={process.env.URL_SITE_LANDING} className={styles.logoLink}>
          <img src={Logo} className={styles.logo} />
        </a>
        {Object.entries(menuItems).map(([key, msg]) =>
          <HeaderLink key={key} to={`/${key}`} className="onlyBigScreen">
            <FormattedMessage {...msg} />
          </HeaderLink>
        )}
      </Menu.Menu>

      <Menu.Menu position="right" className={styles.menuRight}>
        <Menu.Item>
          <AccountSwitcher />
        </Menu.Item>
        <Menu.Item>
          <LanguageSwitcher />
        </Menu.Item>
      </Menu.Menu>
    </div>
  );
}


// import React from 'react';
// import { GreaterThanMobileSegment, MobileSegment } from '@thecointech/shared/components/ResponsiveTool';
// import { MainNavigationMobile } from './MainNavigationMobile';
// import { MainNavigationGreaterThanMobile } from './MainNavigationGreaterThanMobile';

// export const MainNavigation = () =>
//   <>
//     <GreaterThanMobileSegment>
//       <MainNavigationGreaterThanMobile />
//     </GreaterThanMobileSegment>

//     <MobileSegment>
//       <MainNavigationMobile />
//     </MobileSegment>
//   </>
