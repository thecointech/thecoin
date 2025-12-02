import React from 'react';
import { ProviderChoice } from '../ProviderChoice';
import { defineMessage } from 'react-intl';

import icon from "./images/upload.svg";
const text = defineMessage({ defaultMessage:"Upload Wallet", description:"Restore Account: Option to restore wallet from JSON file"});

export const OfflineRestore = () => <ProviderChoice link={"../upload"} txt={text} imgSrc={icon} />
