import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import { Account, RouterPath } from '@thecointech/shared/containers/Account';
import { AccountPageProps } from '@thecointech/shared/containers/Account/types';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { HomePage } from '../HomePage';
import { MakePayments } from 'containers/MakePayments';
import { Topup } from 'containers/TopUp';
import { Settings } from 'containers/Settings';
import { getAvatarLink } from '@thecointech/shared/components/Avatars';
import { CopyToClipboard } from '@thecointech/site-base/components/CopyToClipboard';
import { ContactUs } from 'containers/ContactUs';
import { defineMessages } from 'react-intl';

const translations = defineMessages({
  home : {
      defaultMessage: 'Overview',
      description: 'app.accounts.sidebar.home: Title for the Home entry in the menu'},
  transferin : {
      defaultMessage: 'Top up balance',
      description: 'app.accounts.sidebar.transferin: Title for the transfer entry in the menu'},
  makepayments : {
      defaultMessage: 'Make payments',
      description: 'app.accounts.sidebar.makepayments: Title for the Make payments entry in the menu'},
  settings : {
      defaultMessage: 'Settings',
      description: 'app.accounts.sidebar.settings: Title for the Settings entry in the menu'},
  contact : {
      defaultMessage: 'Contact Us',
      description: 'app.accounts.sidebar.contact: Title for the Contact Us entry in the menu'},
  profile : {
      defaultMessage: 'Profile',
      description: 'app.accounts.sidebar.profile: Title for the Profile entry in the menu'},
  copyLink : {
      defaultMessage: 'Profile',
      description: 'app.accounts.sidebar.copy: Title for the copy button in the menu'}
  });

const AccountRoutes: RouterPath[] = [
  {
    name: translations.home,
    urlFragment: '/',
    creator: (routerProps: AccountPageProps) => ((props) => <HomePage {...props} {...routerProps} />),
    exact: true,
    icon: "home",
  },
  {
    name: translations.transferin,
    urlFragment: 'transferIn',
    creator: (routerProps: AccountPageProps) => ((props) => <Topup {...props} {...routerProps} />),
    icon: "arrow circle up",
  },
  {
    name: translations.makepayments,
    urlFragment: 'makepayments',
    creator: (routerProps: AccountPageProps) => (() => <MakePayments {...routerProps} />),
    icon: "arrow circle right",
  },
  {
    name: translations.settings,
    urlFragment: 'settings',
    creator: () => (() => <Settings />),
    icon: "setting",
  },
  {
    name: translations.contact,
    urlFragment: 'contact',
    creator: () => (() => <ContactUs />),
    icon: "envelope outline",
  },
];



export const Accounts = (props: RouteComponentProps) => {
  const activeAccount = useActiveAccount();
  const { match } = props;
  const { url } = match;

  if (activeAccount){
    if (!AccountRoutes[0].header){
      AccountRoutes.unshift(
        {
          name: translations.profile,
          header: { avatar: getAvatarLink("14"),
                    primaryDescription: activeAccount?.name ?? "Unknown",
                    secondaryDescription: <><CopyToClipboard label={translations.copyLink} payload={activeAccount?.address!} /></> },
      });
    } else {
      AccountRoutes[0].header = {
        avatar: getAvatarLink("14"),
        primaryDescription: activeAccount?.name ?? "Unknown",
        secondaryDescription: <><CopyToClipboard label={translations.copyLink} payload={activeAccount?.address!} /></> };
    }
  }

  return (!activeAccount)
    ? <Redirect to="/addAccount" />
    : <Account account={activeAccount} accountMap={AccountRoutes} url={url} />;
}
