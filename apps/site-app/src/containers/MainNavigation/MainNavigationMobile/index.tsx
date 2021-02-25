import React, { useState } from 'react';
import { Menu, Container, Icon } from 'semantic-ui-react';
import styles from './styles.module.less';
import { AccountSwitcher } from '../../../containers/AccountSwitcher';
import { LanguageSwitcher} from '@the-coin/site-base/containers/LanguageSwitcher';
import { FormattedMessage } from 'react-intl';
import Logo from './logo.svg';
import { NavLink } from 'react-router-dom';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';

const home = { id:"app.MainNavigation.home",
                defaultMessage:"Home",
                description:"Title for the Home entry in the menu"};
const transferin = { id:"app.MainNavigation.transferin",
                  defaultMessage:"Top up balance",
                  description:"Title for the Top up balance entry in the menu"};
const makepayments = {  id:"app.MainNavigation.makepayments",
                    defaultMessage:"Make payments",
                    description:"Title for the Make payments entry in the menu"};
const settings = {  id:"app.MainNavigation.settings",
                    defaultMessage:"Settings",
                    description:"Title for the Settings entry in the menu"};

export const MainNavigationMobile = () => {
    const [modalVisible, setModalVisible] = useState(false);
    
    return (
      <Container>
          <div className={styles.navContainer} id={styles.mainMenuContainer}>
              <Menu secondary className={ `${styles.mainMenu} x2spaceAfter` } >
                <Menu.Menu position='left'>
                  <div>
                    <img src={Logo} id={styles.logo} className={ `x2spaceBefore` }/>
                  </div>
                </Menu.Menu>
                <Menu.Menu position='right'>
                  <Menu.Item>
                    <AccountSwitcher />
                  </Menu.Item>
                  <Menu.Item>
                    <LanguageSwitcher />
                  </Menu.Item>
                  <Menu.Item>
                    <Icon name="content" onClick={()=>setModalVisible(true)} />
                      <ModalOperation isOpen={modalVisible} closeIcon={true} progressPercent={1}>
                        <Menu vertical id={styles.userMenu}>
                            <Menu.Item as={ NavLink } to='/' onClick={()=>setModalVisible(false)}>
                              <Icon name="home" size={"huge"}/><FormattedMessage {...home} />
                            </Menu.Item>
                            <Menu.Item as={ NavLink } to='/transfertin' onClick={()=>setModalVisible(false)}>
                              <Icon name="home" size={"huge"} /><FormattedMessage {...transferin} />
                            </Menu.Item>
                            <Menu.Item as={ NavLink } to='/makepayments' onClick={()=>setModalVisible(false)}>
                              <Icon name="home" size={"huge"} /><FormattedMessage {...makepayments} />
                            </Menu.Item>
                            <Menu.Item as={ NavLink } to='/settings' onClick={()=>setModalVisible(false)}>
                              <Icon name="home" size={"huge"} /><FormattedMessage {...settings} />
                            </Menu.Item>
                        </Menu>
                      </ModalOperation>
                  </Menu.Item>
                </Menu.Menu>
              </Menu>
            </div>
      </Container>
    );
}
