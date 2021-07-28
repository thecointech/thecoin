
import { AccountId } from '@thecointech/signers';
import { RUrl } from '@thecointech/utilities/RUrl';
import { defineMessages } from 'react-intl';
import { TheCoinRoutes } from '../TheCoinAccount/Routes';
import { BrokerCADRoutes } from '../BrokerCAD/Routes';

const messages = defineMessages({
  balance: { defaultMessage: "Balance", description: "Title for the balance entry in the menu" },
  mint: { defaultMessage: "Minting", description: "Title for the minting entry in the menu" },
  purchase: { defaultMessage: "Complete Purchase", description: "Title for the purchase entry in the menu" },

  eTransfer: { defaultMessage: "Complete e-Transfer", description: "Title for the Complete e-Transfer entry in the menu" },
  billing: { defaultMessage: "Bill Payments", description: "Title for the Bill Payments entry in the menu" },
  verify: { defaultMessage: "Verify", description: "Title for the Verify entry in the menu" },
  autoPurchase: { defaultMessage: "AutoPurchase", description: "Title for the AutoPurchase entry in the menu" },
  clients: { defaultMessage: "Clients", description: "Title for the Clients entry in the menu" },
});

const buildSubMenu = (id: AccountId, routes: typeof TheCoinRoutes|typeof BrokerCADRoutes) =>
  (Object.keys(routes) as (keyof typeof routes)[])
    .map(el => ({
      link: {
        name: messages[el].defaultMessage,
        to: new RUrl(`/${id}/${el}`)
      }
    }))

export const items = [
  {
    link: {
      name: "TheCoin",
      to: false,
    },
    subItems: buildSubMenu(AccountId.TheCoin, TheCoinRoutes)
  },
  {
    link: {
      name: "BrokerCAD",
      to: false,
    },
    subItems: buildSubMenu(AccountId.BrokerCAD, BrokerCADRoutes)
  }
]



