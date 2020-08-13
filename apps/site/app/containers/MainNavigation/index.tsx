import React from 'react';
import { Menu, Container, Responsive, Segment } from 'semantic-ui-react';
import HeaderLink from '../../components/HeaderLink';
import styles from './index.module.css';
import { AccountSwitcher } from 'containers/AccountSwitcher';
import { FormattedMessage } from 'react-intl';

class Navigation extends React.Component {
  render() {
    return (
      <Container>
      <Responsive as={Segment} {...Responsive.onlyComputer}>
          <div className={styles.navContainer} id="mainMenuContainer">
              <Menu secondary className={styles.mainMenu} >
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

                <Responsive as={Segment} {...Responsive.onlyMobile}>

                </Responsive> 
              </Menu>
              <AccountSwitcher />
          </div>

          </Responsive>
          <Responsive as={Segment} {...Responsive.onlyMobile}>
            <div className={styles.navContainer} id="mainMenuContainer">
                <Menu secondary className={styles.mainMenu} >
                    <HeaderLink to="/FAQ">
                      <FormattedMessage id="site.MainNavigation.yourbenefits"
                        defaultMessage="Your benefits"
                        description="Title for the Your benefits entry in the menu"
                        values={{ what: 'react-intl' }}/>
                    </HeaderLink>
                </Menu>
                <AccountSwitcher />
              </div>
          </Responsive> 
      </Container>   
    );
  }
}

export default Navigation;
