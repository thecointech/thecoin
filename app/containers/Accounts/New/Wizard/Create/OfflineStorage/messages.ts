/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Create.Backup';

export default defineMessages({
	stepHeader: {
    id: `${scope}.stepHeader`,
    defaultMessage: 'Offline Storage',
  },
  stepSubHeader: {
    id: `${scope}.stepSubHeader`,
    defaultMessage: 'Backup your Wallet',
  },
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Offline Storage',
	},
	subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Protect against accidental loss',
  },
  para1: {
    id: `${scope}.para1`,
    defaultMessage:
			"It is very important to take precautions against accidental loss.",
	},
	para2: {
    id: `${scope}.para2`,
    defaultMessage:
			"Just like your physical wallet, The Coin wallets are not automatically\
			stored online.  This guarantees the bad guys can't get to them, but just\
			like your physical wallet you want to take precautions against losing it."
  },
  printButton: {
		id: `${scope}.printButton`,
    defaultMessage: "PRINT"
	},
	printMessage: {
    id: `${scope}.printMessage`,
    defaultMessage:
      "Print your wallet and store it somewhere secure."
  },
  
	downloadMessage: {
    id: `${scope}.downloadMessage`,
    defaultMessage:
      "Download your encrypted wallet for storage on a USB."
	},


});