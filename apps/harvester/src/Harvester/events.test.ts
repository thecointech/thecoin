import { EventSection } from "@thecointech/scraper-agent";
import { setEvents, getEvents } from "./events";

describe('setting/getting events', () => {

  const creditSection: EventSection = { section: 'Initial', events: [{ type: 'click', id: 'credit'} as any] };
  const chequingSection: EventSection = { section: 'Initial', events: [{ type: 'click', id: 'chequing'} as any] };

  it('should set both events when both is set', async () => {
    await setEvents("both", creditSection);
    const credit = await getEvents("visaBalance");
    expect(credit[0].id).toEqual("credit");
    const chequing = await getEvents("chqBalance");
    expect(chequing[0].id).toEqual("credit");
  });

  it('should set only chequing events', async () => {
    await setEvents("both", {} as any);
    await setEvents("chequing", chequingSection);
    const chequing = await getEvents("chqBalance");
    expect(chequing[0].id).toEqual("chequing");
    await expect(getEvents("visaBalance")).rejects.toThrow();
  });

  it('should set only credit events', async () => {
    await setEvents("both", {} as any);
    await setEvents("credit", creditSection);
    const credit = await getEvents("visaBalance");
    expect(credit[0].id).toEqual("credit");
    await expect(getEvents("chqBalance")).rejects.toThrow();
  });

  it('setting both overrides initial settings', async () => {
    await setEvents("credit", creditSection);
    await setEvents("both", chequingSection);
    const credit = await getEvents("visaBalance");
    expect(credit[0].id).toEqual("chequing");
    const chequing = await getEvents("chqBalance");
    expect(chequing[0].id).toEqual("chequing");
  });
});
