import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { fetchRate, weSellAt } from '@thecointech/fx-rates';
import Decimal from 'decimal.js-light';
import { toCoinDecimal } from '@thecointech/utilities';
import { connect } from '@thecointech/contract-base/connect';
import { sleep } from '@thecointech/async';

// Assume devlive
if (process.env.CONFIG_NAME !== 'devlive') throw new Error('Not Sufficiently Tested');

log.debug('Seeding ShockAbsorber');
async function main() {

}

main();
