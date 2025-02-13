import { EventSection, SectionName } from "@thecointech/scraper-agent";
import { flatten, setEvents, getEvents } from "./events";
import { AnyEvent } from "@thecointech/scraper/types";
import { setProcessConfig } from './config';

describe('flatten', () => {
  // Helper to create a mock event
  const createEvent = (id: number): AnyEvent => ({
    type: 'click',
    id: id.toString(),
    clickX: 100,
    clickY: 200
  } as AnyEvent);

  // Helper to create a section
  const createSection = (name: SectionName, events: (AnyEvent | EventSection)[]): EventSection => ({
    section: name,
    events
  });

  it('should return empty array for empty section', () => {
    const section = createSection('Initial', []);
    const result = flatten(section, ['Initial']);
    expect(result).toEqual([]);
  });

  it('should keep events from specified sections', () => {
    const event1 = createEvent(1);
    const event2 = createEvent(2);
    const section = createSection('Initial', [event1, event2]);

    const result = flatten(section, ['Initial']);
    expect(result).toEqual([event1, event2]);
  });

  it('should ignore events from non-specified sections', () => {
    const event1 = createEvent(1);
    const section = createSection('Initial', [event1]);

    const result = flatten(section, ['Login']);
    expect(result).toEqual([]);
  });

  it('should handle nested sections', () => {
    const event1 = createEvent(1);
    const event2 = createEvent(2);
    const event3 = createEvent(3);

    const nestedSection = createSection('Login', [event2]);
    const deepNestedSection = createSection('AccountsSummary', [event3]);
    const section = createSection('Initial', [
      event1,
      nestedSection,
      deepNestedSection
    ]);

    const result = flatten(section, ['Initial', 'AccountsSummary']);
    expect(result).toEqual([event1, event3]);
  });

  it('should handle multiple sections at same level', () => {
    const event1 = createEvent(1);
    const event2 = createEvent(2);
    const event3 = createEvent(3);

    const section1 = createSection('Login', [event1]);
    const section2 = createSection('AccountsSummary', [event2]);
    const section3 = createSection('SendETransfer', [event3]);

    const rootSection = createSection('Initial', [
      section1,
      section2,
      section3
    ]);

    const result = flatten(rootSection, ['Login', 'SendETransfer']);
    expect(result).toEqual([event1, event3]);
  });

  it('should handle real section names', () => {
    const event1 = createEvent(1);
    const event2 = createEvent(2);

    const section = createSection('Initial', [
      event1,
      createSection('Landing', [
        event2,
        createSection('Login', [createEvent(3)])
      ])
    ]);

    const result = flatten(section, ['Initial', 'Landing', 'Login']);
    expect(result).toEqual([event1, event2, createEvent(3)]);
  });
});

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
