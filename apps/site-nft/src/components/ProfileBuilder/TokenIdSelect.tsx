import React, { useState, useEffect } from 'react';
import { connectNFT } from '@thecointech/nft-contract';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';
import { defineMessage, useIntl } from 'react-intl';
import { Select } from 'semantic-ui-react';


const noTokenToSelect = defineMessage({ defaultMessage: "No Tokens Available", description: "Profile default message for no tokens" });
const selectTokenId =   defineMessage({ defaultMessage: "Select Token ID", description: "Profile option to select owned token" });


type TokenIdSelectProps = {
  tokenIds: number[],
  setTokenIds: (v: number[]) => void,
}
export const TokenIdSelect = ({ tokenIds, setTokenIds }: TokenIdSelectProps) => {
  let cancelled = false;
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  const {address} = account!

  useEffect(() => {
    if (!account?.signer)
      return undefined;

    setLoading(true);
    const nft = connectNFT(account.signer);
    nft.balanceOf(address)
      .then(balance => {
        log.trace(`User has ${balance.toString()} tokens`);
        return cancelled
          ? []
          : Promise.all(
              Array.from(
                { length: balance.toNumber() },
                (_, idx) => nft.tokenOfOwnerByIndex(address, idx)
              )
            )
      }).then(ids => {
        if (!cancelled) {
          const ownedIds = ids.map(ids => ids.toNumber())
          log.trace(`Tokens available: ${JSON.stringify(ownedIds)}`);
          setTokenIds(ownedIds);
          setLoading(false);
        }
      }).catch(err => {
        log.error(err, "Cannot load tokens for {address}");
        throw err;
      })
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

