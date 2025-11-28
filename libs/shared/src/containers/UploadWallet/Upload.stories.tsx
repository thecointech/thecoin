import { action } from 'storybook/actions';
import { IsValidAddress } from '@thecointech/utilities';
import React from 'react';
import { UploadWallet as Component } from '.';

export default {
  title: "Shared/Upload",
  component: Component,
}

const onValidateAction = action("onValidate");
const onUploadAction = action("onUpload");
export const Upload = () => {
  return <Component
    onValidate={(data) => { onValidateAction(data.wallet.address); return IsValidAddress(data.wallet.address) }}
    onUpload={(data) => onUploadAction(data.wallet.address)}
  />
}
