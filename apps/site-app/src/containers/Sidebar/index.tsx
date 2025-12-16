import React from 'react';
import { getAvatarLink } from '@thecointech/shared/components/Avatars';
import { AccountMap } from '@thecointech/redux-accounts';
import { SidebarItemsReducer, type SidebarLink } from '@thecointech/shared/containers/PageSidebar';
import { defineMessages, useIntl } from 'react-intl';
import { isLocal } from '@thecointech/signers';

import { getOpenRoutes, type AuthPathKey } from '../App/Routes';
import { useLocation } from 'react-router';

const translations = defineMessages({
  home: {
    defaultMessage: 'Overview',
    description: 'app.accounts.sidebar.home: Title for the Home entry in the menu'
  },
  transferin: {
    defaultMessage: 'Top up balance',
    description: 'app.accounts.sidebar.transferin: Title for the transfer entry in the menu'
  },
  makepayments: {
    defaultMessage: 'Make payments',
    description: 'app.accounts.sidebar.makepayments: Title for the Make payments entry in the menu'
  },
  settings: {
    defaultMessage: 'Settings',
    description: 'app.accounts.sidebar.settings: Title for the Settings entry in the menu'
  },
  contact: {
    defaultMessage: 'Contact Us',
    description: 'app.accounts.sidebar.contact: Title for the Contact Us entry in the menu'
  },
  profile: {
    defaultMessage: 'Profile',
    description: 'app.accounts.sidebar.profile: Title for the Profile entry in the menu'
  },
  noAccount: {
    defaultMessage: 'No Account Loaded',
    description: 'app.accounts.sidebar.profile: Default account name to show in sidebar when no accounts loaded'
  },
})

// To ensure links are safe, we re-use
// the keys from the routes object.

type AuthPrefixedPath = "/" | `/${AuthPathKey}`;

type AuthSidebarLink = Omit<SidebarLink, 'to'> & {
  to: AuthPrefixedPath;
}
const sidebarLinks: AuthSidebarLink[] = [
  {
    name: translations.home,
    to: `/`,
    icon: "home"
  },
  {
    name: translations.transferin,
    to: `/transferIn`,
    icon: "arrow circle up"
  },
  {
    name: translations.makepayments,
    to: `/makePayments`,
    icon: "arrow circle right"
  },
  {
    name: translations.settings,
    to: `/settings`,
    icon: "setting"
  },
  {
    name: translations.contact,
    to: "/contact",
    icon: "envelope outline"
  }
]

SidebarItemsReducer.initialize({
  items: {
    header: null,
    links: sidebarLinks,
  }
})

export function useSidebar() {

  const active = AccountMap.useActive();
  SidebarItemsReducer.useStore();
  const sidebarApi = SidebarItemsReducer.useApi();
  const location = useLocation();
  const intl = useIntl();


  // Update the header whenever the active account is changed.
  React.useEffect(() => {
    sidebarApi.setHeader({
      title: translations.profile,
      avatar: getAvatarLink("14"),
      accountName: active?.name ?? intl.formatMessage(translations.noAccount),
      address: active?.address ?? "-----------",
    })
  }, [active?.address]);

  // We do not want the sidebar to display when in an open route
  React.useEffect(() => {
    // Do not show sidebar if not signed in
    let showSidebar = !!(
      active &&
      (
        (isLocal(active.signer) && active.signer.signingKey) ||
        (active.signer.provider)
      )
    );
    // Do not show sidebar if on open route
    if (showSidebar) {
      const openRoutes = getOpenRoutes();
      const pathStarts = location.pathname.slice(1);
      showSidebar = !(pathStarts && openRoutes.find(r => pathStarts.startsWith(r)));
    }
    sidebarApi.setVisible(showSidebar);
  }, [location.pathname, active?.signer]);
}
