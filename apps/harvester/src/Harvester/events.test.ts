import { EventSection } from "@thecointech/scraper-agent";
import { setEvents, getEvents } from "./events";
import { ActionType } from "./replay";
import { AnyEvent } from "@thecointech/scraper";
import { jest } from '@jest/globals';
import { BankEvents } from "@thecointech/store-harvester";


jest.setTimeout(10* 60* 1000)
describe('setting/getting events', () => {

  const creditSection: BankEvents = {
    name: 'abank',
    url: 'https://credit.com',
    username: 'credit',
    password: 'credit',
    accounts: [],
    events: { section: 'Initial', events: [{ type: 'click', id: 'credit'} as any] }
  };
  const chequingSection: BankEvents = {
    name: 'abank',
    url: 'https://chequing.com',
    username: 'chequing',
    password: 'chequing',
    accounts: [],
    events: { section: 'Initial', events: [{ type: 'click', id: 'chequing'} as any] }
  };

  const getEventArray = async (type: ActionType) => {
    const events = await getEvents(type);
    return events.events as AnyEvent[];
  };

  it('should set both events when both is set', async () => {
    await setEvents("both", creditSection);
    const credit = await getEventArray("visaBalance");
    expect(credit[0].id).toEqual("credit");
    const chequing = await getEventArray("chqBalance");
    expect(chequing[0].id).toEqual("credit");
  });

  it('should split both when setting chequing', async () => {
    await setEvents("both", creditSection);
    await setEvents("chequing", chequingSection);
    const chequing = await getEventArray("chqBalance");
    expect(chequing[0].id).toEqual("chequing");
    const credit = await getEventArray("visaBalance");
    expect(credit[0].id).toEqual("credit");
  });

  it('should split both when setting credit', async () => {
    await setEvents("both", chequingSection );
    await setEvents("credit", creditSection);
    const credit = await getEventArray("visaBalance");
    expect(credit[0].id).toEqual("credit");
    const chequing = await getEventArray("chqBalance");
    expect(chequing[0].id).toEqual("chequing");
  });

  it('setting both overrides initial settings', async () => {
    await setEvents("credit", creditSection);
    await setEvents("both", chequingSection);
    const credit = await getEventArray("visaBalance");
    expect(credit[0].id).toEqual("chequing");
    const chequing = await getEventArray("chqBalance");
    expect(chequing[0].id).toEqual("chequing");
  });
});
