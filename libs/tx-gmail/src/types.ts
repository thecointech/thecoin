import type { gmail_v1 } from 'googleapis';
import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';

export type eTransferData = {
  name: string,
  email: string,
  id: string,

  cad: Decimal,
  address: string,
  recieved: DateTime,
  depositUrl: string,

  // Store the raw data
  subject?: string,
  body?: string,
  raw?: gmail_v1.Schema$Message,
}
