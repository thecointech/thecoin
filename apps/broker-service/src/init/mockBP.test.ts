import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import axios from 'axios';
import { fetchUser } from '@thecointech/blockpass/fetch';
import type { BlockpassData } from '@thecointech/blockpass/types';
import { addMockBPEndpoint } from './mockBP';

const address = '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc';
const store = globalThis as typeof globalThis & { __BP_CLIENTDATA?: Map<string, BlockpassData> };

describe('mock Blockpass round trip', () => {
  let server: Server;
  let url: string;
  const config = process.env.CONFIG_NAME;
  const previousStore = store.__BP_CLIENTDATA;

  async function start(configName: string) {
    process.env.CONFIG_NAME = configName;
    const app = express();
    app.use(express.json());
    addMockBPEndpoint(app);
    await new Promise<void>(resolve => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1/mock/blockpass/${address}`;
  }

  beforeEach(() => { store.__BP_CLIENTDATA = new Map(); });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    if (config === undefined) delete process.env.CONFIG_NAME;
    else process.env.CONFIG_NAME = config;
    if (previousStore === undefined) delete store.__BP_CLIENTDATA;
    else store.__BP_CLIENTDATA = previousStore;
  });

  it('passes submitted fields to fetchUser in devlive', async () => {
    await start('devlive');
    const fields = {
      givenName: 'Jane', familyName: 'Doe', dob: '01/02/1990',
      street: '123 Test Street', city: 'Toronto', country: 'CAN',
    };
    const response = await axios.post(url, fields);
    expect(response.status).toBe(204);

    const data = await fetchUser(address.toLowerCase());
    expect(data.status).toBe('approved');
    expect(data.refId).toBe(address);
    expect(data.identities.given_name.value).toBe(fields.givenName);
    expect(data.identities.family_name.value).toBe(fields.familyName);
    expect(data.identities.dob.value).toBe(fields.dob);
    expect(JSON.parse(data.identities.address!.value)).toEqual({
      address: fields.street, city: fields.city, country: fields.country,
    });

    data.identities.given_name.value = 'Changed';
    expect((await fetchUser(address)).identities.given_name.value).toBe(fields.givenName);
  });

  it('does not expose the endpoint in production', async () => {
    await start('prod');
    const response = await axios.post(url, {}, { validateStatus: () => true });
    expect(response.status).toBe(404);
    await expect(fetchUser(address)).rejects.toThrow('Cannot fetch blockpass data');
  });
});
