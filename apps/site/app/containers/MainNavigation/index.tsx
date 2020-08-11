import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import HeaderLink from '../../components/HeaderLink';
import styles from './index.module.css';
import { AccountSwitcher } from 'containers/AccountSwitcher';
import { FormattedMessage } from 'react-intl';

class Navigation extends React.Component {
  render() {
    return (
      <div className={styles.navContainer}>
        <Container>
          <Menu secondary className={styles.mainMenu} id="mainMenu">
            <HeaderLink to="/" exact>
              <FormattedMessage id="site.MainNavigation.home"
                defaultMessage="Home"
                description="Title for the Home entry in the menu"
                values={{ what: 'react-intl' }}/>
            </HeaderLink>
            <HeaderLink to="/howItWorks">
              <FormattedMessage id="site.MainNavigation.indepth"
                defaultMessage="In-depth"
                description="Title for the In-depth entry in the menu"
                values={{ what: 'react-intl' }}/>
            </HeaderLink>
            <HeaderLink to="/FAQ">
              <FormattedMessage id="site.MainNavigation.wedomore"
                defaultMessage="We do more"
                description="Title for the We do more entry in the menu"
                values={{ what: 'react-intl' }}/>
            </HeaderLink>
            <HeaderLink to="/FAQ">
              <FormattedMessage id="site.MainNavigation.yourbenefits"
                defaultMessage="Your benefits"
                description="Title for the Your benefits entry in the menu"
                values={{ what: 'react-intl' }}/>
            </HeaderLink>
          </Menu>
          <AccountSwitcher />
        </Container>   
      </div>
    );
  }
}

export default Navigation;
