import type { Express } from 'express';
import type { BlockpassData } from '@thecointech/blockpass/types';
import { log } from '@thecointech/logging';


export function addMockBPEndpoint(app: Express) {
  if (process.env.CONFIG_NAME === 'devlive') {
    app.post('/api/v1/mock/blockpass/:address', (req, res) => {
      log.info(`Recieved mock Blockpass request - address: ${req.params.address}, body: ${JSON.stringify(req.body)}`);
      const err = setBPMockData(req.params, req.body);
      if (err) {
        res.status(400).json({ message: err });
        return;
      }
      res.sendStatus(204);
    });
  }
}

export function setBPMockData(params: { address: string }, fields: Record<string, string>) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(params.address) ||
    !fields || !['givenName', 'familyName', 'dob', 'street', 'city', 'country'].every(
      key => fields[key] === undefined || (typeof fields[key] === 'string' && fields[key].length <= 1000)
    )) {
    return 'Invalid mock identity';
  }

  const store = globalThis as typeof globalThis & {
    __BP_CLIENTDATA?: Map<string, BlockpassData>;
  };

  store.__BP_CLIENTDATA ??= new Map();
  const address = params.address.toLowerCase();
  if (store.__BP_CLIENTDATA.size >= 1000 && !store.__BP_CLIENTDATA.has(address)) {
    return 'Mock identity store is full; restart the service'
  }

  const now = new Date().toISOString();
  store.__BP_CLIENTDATA.set(address, {
    status: 'approved', refId: params.address, isArchived: false,
    blockPassID: `mock-${address}`, inreviewDate: now, waitingDate: now,
    customFields: { RiskLevel: 'Low' }, certs: {},
    identities: {
      given_name: { type: 'string', value: fields.givenName || 'Mock' },
      family_name: { type: 'string', value: fields.familyName || address },
      dob: { type: 'string', value: fields.dob && fields.dob !== 'null' ? fields.dob : '01/01/1990' },
      address: {
        type: 'string', value: JSON.stringify({
          address: fields.street || '', city: fields.city || '', country: fields.country || '',
        })
      },
    },
  });
  return undefined;
}
