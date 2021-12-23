
import { AccountId } from '@thecointech/signers';
import { RUrl } from '@thecointech/utilities/RUrl';
import { defineMessage, defineMessages } from 'react-intl';
import { TheCoinRoutes } from '../containers/TheCoinAccount/Routes';
import { BrokerCADRoutes } from '../containers/BrokerCAD/Routes';
import { SidebarState } from '@thecointech/shared/containers/PageSidebar/types';
import { SidebarItemsReducer } from '@thecointech/shared/containers/PageSidebar/reducer';

const messages = defineMessages({
  balance: { defaultMessage: "Balance", description: "Title for the balance entry in the menu" },
  mint: { defaultMessage: "Minting", description: "Title for the minting entry in the menu" },
  purchase: { defaultMessage: "Complete Purchase", description: "Title for the purchase entry in the menu" },

  eTransfer: { defaultMessage: "Complete e-Transfer", description: "Title for the Complete e-Transfer entry in the menu" },
  billing: { defaultMessage: "Bill Payments", description: "Title for the Bill Payments entry in the menu" },
  incomplete: { defaultMessage: "Incomplete", description: "Menu Entry: List of incomplete transactions" },
  verify: { defaultMessage: "Verify", description: "Title for the Verify entry in the menu" },
  autoPurchase: { defaultMessage: "AutoPurchase", description: "Title for the AutoPurchase entry in the menu" },
  clients: { defaultMessage: "Clients", description: "Title for the Clients entry in the menu" },
});

const buildSubMenu = (id: AccountId, routes: typeof TheCoinRoutes|typeof BrokerCADRoutes) =>
  (Object.keys(routes) as (keyof typeof routes)[])
    .map(el => ({
      name: messages[el],
      to: new RUrl(`/${id}/${el}`)
    }))

const state : Partial<SidebarState> = {
  items: {
    header: null,
    links: [
      {
        name: defineMessage({ defaultMessage: "TheCoin" }),
        to: false,
        subItems: buildSubMenu(AccountId.TheCoin, TheCoinRoutes)
      },
      {
        name: defineMessage({ defaultMessage: "BrokerCAD" }),
        to: false,
        subItems: buildSubMenu(AccountId.BrokerCAD, BrokerCADRoutes)
      }
    ]
  }
}

export const initSidebar = () => SidebarItemsReducer.initialize(state)
