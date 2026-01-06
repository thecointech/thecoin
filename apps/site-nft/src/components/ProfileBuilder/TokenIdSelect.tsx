import React, { useState, useEffect } from 'react';
import { connectNFT } from '@thecointech/contract-nft';
import { AccountMap } from '@thecointech/redux-accounts';
import { log } from '@thecointech/logging';
import { defineMessage, useIntl } from 'react-intl';
import { Select } from 'semantic-ui-react';

const noTokenToSelect = defineMessage({ defaultMessage: "No Tokens Available", description: "Profile default message for no tokens" });
const selectTokenId =   defineMessage({ defaultMessage: "Select Token ID", description: "Profile option to select owned token" });

type Props = {
  tokenIds: number[],
  setTokenIds: (v: number[]) => void,
}
export const TokenIdSelect = ({ tokenIds, setTokenIds }: Props) => {
  let cancelled = false;
  const [loading, setLoading] = useState(false);
  const account = AccountMap.useActive();
  const {address} = account!

  useEffect(() => {
    if (!account?.signer)
      return undefined;

    setLoading(true);
    (async () => {
      try {
        const nft = await connectNFT(account.signer);
        const balance = await nft.balanceOf(address);
        log.trace(`User has ${balance.toString()} tokens`);
        if (cancelled) return;
        // Get all tokens
        const ids = await Promise.all(
          Array.from(
            { length: Number(balance) },
            (_, idx) => nft.tokenOfOwnerByIndex(address, idx)
          )
        )
        if (cancelled) return;
        const ownedIds = ids.map(ids => Number(ids))
        log.trace(`Tokens available: ${JSON.stringify(ownedIds)}`);
        setTokenIds(ownedIds);
      }
      catch (e: any) {
        log.error(e, "failed to load tokens");
      }
      finally {
        setLoading(false);
      }
    })()
    return () => { cancelled = true; }
  }, [account?.signer])

  return (
    <Select
      placeholder={
        useIntl().formatMessage(
          tokenIds.length == 0
            ? noTokenToSelect
            : selectTokenId
        )}
      loading={loading}
      multiple selection
      options={tokenIds.map(id => ({ key: id, value: id, text: id }))}
    />
  )
}

