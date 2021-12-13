import React, { useState } from 'react';
import { Menu, Container, Icon } from 'semantic-ui-react';
import styles from './styles.module.less';
import { AccountSwitcher } from '@thecointech/site-base/components/AccountSwitcher';
import { LanguageSwitcher} from '@thecointech/site-base/containers/LanguageSwitcher';
import { defineMessages, FormattedMessage } from "react-intl";
import Logo from './images/logo.svg';
import { NavLink } from 'react-router-dom';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';

const translations = defineMessages({
  home : {
      defaultMessage: 'Overview',
      description: 'app.MainNavigation.home: Title for the entry in the sidebar menu'},
  transferin : {
      defaultMessage: 'Top up balance',
      description: 'app.MainNavigation.transferin: Title for the entry in the sidebar menu'},
  makepayments : {
      defaultMessage: 'Make payments',
      description: 'app.MainNavigation.makepayments: Title for the entry in the sidebar menu'},
  settings : {
      defaultMessage: 'Settings',
      description: 'app.MainNavigation.settings: Title for the entry in the sidebar menu'},
  contact : {
      defaultMessage: 'Contact Us',
      description: 'app.MainNavigation.contact: Title for the entry in the sidebar menu'}
});

export const MainNavigationMobile = () => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
      <Container>
          <div className={styles.navContainer} id={styles.mainMenuContainer}>
              <Menu secondary className={ `${styles.mainMenu}` } >
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
                      <ModalOperation isOpen={modalVisible} closeIconFct={()=>setModalVisible(false)}>
                        <Menu vertical id={styles.userMenu}>
                            <Menu.Item as={ NavLink } to='/' onClick={()=>setModalVisible(false)}>
                              <Icon name="home" size={"big"} className={"x1spaceBefore"}/><FormattedMessage {...translations.home} />
                            </Menu.Item>
                            <Menu.Item as={ NavLink } to='/transferIn' onClick={()=>setModalVisible(false)}>
                              <Icon name="arrow circle up" size={"big"} className={"x1spaceBefore"}/><FormattedMessage {...translations.transferin} />
                            </Menu.Item>
                            <Menu.Item as={ NavLink } to='/makepayments' onClick={()=>setModalVisible(false)}>
                              <Icon name="arrow circle right" size={"big"} className={"x1spaceBefore"}/><FormattedMessage {...translations.makepayments} />
                            </Menu.Item>
                            <Menu.Item as={ NavLink } to='/settings' onClick={()=>setModalVisible(false)}>
                              <Icon name="setting" size={"big"} className={"x1spaceBefore"}/><FormattedMessage {...translations.settings} />
                            </Menu.Item>
                            <Menu.Item as={ NavLink } to='/contact' onClick={()=>setModalVisible(false)}>
                              <Icon name="envelope outline" size={"big"} className={"x1spaceBefore"}/><FormattedMessage {...translations.contact} />
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
