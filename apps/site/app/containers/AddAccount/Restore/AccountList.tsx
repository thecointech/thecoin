import React from "react";
import { GoogleWalletItem } from "@the-coin/types";
import { useAccountMap, useAccountMapApi } from "@the-coin/shared/containers/AccountMap";
import { List, Button } from "semantic-ui-react";
import { Wallet } from "ethers";

type Props = {
  wallets: GoogleWalletItem[],
}

export const AccountList = ({ wallets }: Props) => {
  const existing = useAccountMap();
  const existingAccounts = Object.values(existing);

  const accountMapApi = useAccountMapApi();


  return wallets
    ? (
      <List divided relaxed>
        {
          wallets
            .filter(w => w.wallet && w.id.name)
            .map(w => ({
              wallet: JSON.parse(w.wallet!) as Wallet,
              id: w.id.id,
              name: w.id.name!,
            }))
            .map(w => ({
              ...w,
              exists: !existingAccounts.find(e => e.signer.address === w.wallet?.address)
            }))
            .map(w => (
              <List.Item key={w.id}>
                <List.Content>
                  {w.name}
                  <Button
                    disabled={w.exists}
                    style={{ float: "right" }}
                    onClick={() => accountMapApi.addAccount(w.name, w.wallet, true)}
                  >
                    {
                      w.exists ? 'Already Loaded' : 'Restore'
                    }
                  </Button>
                </List.Content>
              </List.Item>
            ))
        }
      </List>
    )
  : null;
}
