import { flatten, stripDuplicateNavigations } from './autoConfigure';
import type { EventSection, SectionName } from '@thecointech/scraper-agent';
import type { AnyEvent, LoadEvent, NavigationEvent } from '@thecointech/scraper/types';

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

describe('stripDuplicateNavigations', () => {

  it('should handle empty array', () => {
    const events: AnyEvent[] = [];
    expect(stripDuplicateNavigations(events)).toEqual([]);
  });

  it('should keep single navigation event', () => {
    const events: AnyEvent[] = [
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
    ];
    expect(stripDuplicateNavigations(events)).toEqual(events);
  });

  it('should remove consecutive duplicate navigation events', () => {
    const events: AnyEvent[] = [
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'load' } as LoadEvent,
    ];
    const expected: AnyEvent[] = [
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'load' } as LoadEvent,
    ];
    expect(stripDuplicateNavigations(events)).toEqual(expected);
  });

  // it('should keep different consecutive navigation events', () => {
  //   const events: AnyEvent[] = [
  //     { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
  //     { type: 'navigation', to: 'http://other.com' } as NavigationEvent,
  //   ];
  //   expect(stripDuplicateNavigations(events)).toEqual(events);
  // });

  it('should handle mixed event types', () => {
    const events: AnyEvent[] = [
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'load' } as LoadEvent,
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
    ];
    expect(stripDuplicateNavigations(events)).toEqual(events);
  });

  it('should remove multiple consecutive duplicates', () => {
    const events: AnyEvent[] = [
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'load' } as LoadEvent,
    ];
    const expected: AnyEvent[] = [
      { type: 'navigation', to: 'http://example.com' } as NavigationEvent,
      { type: 'load' } as LoadEvent,
    ];
    expect(stripDuplicateNavigations(events)).toEqual(expected);
  });
});
