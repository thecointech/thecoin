
import { flatten } from './events'
import { EventSection, SectionName } from '../types'
import { AnyEvent } from '@thecointech/scraper';

describe('flatten', () => {
  // Helper to create a mock event
  const createEvent = (id: number, section?: SectionName): AnyEvent => ({
    type: 'click',
    id: id.toString(),
    clickX: 100,
    clickY: 200,
    section
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

  it('Should inject section name into events', () => {
    const event1 = createEvent(1);
    const event2 = createEvent(2);
    const section = createSection('Initial', [event1, event2]);

    const result = flatten(section, ['Initial']);
    expect(result).toEqual([
      { ...event1, section: 'Initial' },
      { ...event2, section: 'Initial' }
    ]);
  });

  it('should keep events from specified sections', () => {
    const event1 = createEvent(1, 'Initial');
    const event2 = createEvent(2, 'Initial');
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
    const event1 = createEvent(1, 'Initial');
    const event2 = createEvent(2, 'Login');
    const event3 = createEvent(3, 'AccountsSummary');

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
    const event1 = createEvent(1, "Login");
    const event2 = createEvent(2, "AccountsSummary");
    const event3 = createEvent(3, "SendETransfer");

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

  it('should include section name for nested sections', () => {
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
    expect(result).toEqual([
      { ...event1, section: 'Login' },
      { ...event3, section: 'SendETransfer' }
    ]);
  });

  it('should handle real section names', () => {
    const event1 = createEvent(1, 'Initial');
    const event2 = createEvent(2, 'Landing');
    const event3 = createEvent(3, 'Login');

    const section = createSection('Initial', [
      event1,
      createSection('Landing', [
        event2,
        createSection('Login', [event3])
      ])
    ]);

    const result = flatten(section, ['Initial', 'Landing', 'Login']);
    expect(result).toEqual([event1, event2, event3]);
  });
});
