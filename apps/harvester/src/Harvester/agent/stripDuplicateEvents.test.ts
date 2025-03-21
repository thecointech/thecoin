import { EventSection } from '@thecointech/scraper-agent';
import { stripDuplicateNavigationsSection } from './stripDuplicateEvents';
import type { AnyEvent, LoadEvent, NavigationEvent } from '@thecointech/scraper/types';

describe('stripDuplicateNavigationsSection', () => {
  it('should return empty events array for empty section', () => {
    const section = createEventSection();
    const result = stripDuplicateNavigationsSection(section);
    expect(result.events).toEqual([]);
  });

  it('should keep non-navigation events unchanged', () => {
    const events = [
      createLoadEvent('1'),
      createLoadEvent('2')
    ];
    const section = createEventSection(events);
    const result = stripDuplicateNavigationsSection(section);
    expect(result.events).toEqual(events);
  });

  it('should keep single navigation event', () => {
    const navEvent = createNavEvent('http://example.com');
    const section = createEventSection([navEvent]);
    const result = stripDuplicateNavigationsSection(section);
    expect(result.events).toEqual([navEvent]);
  });

  it('should remove consecutive navigation events', () => {
    const events = [
      createNavEvent('http://example.com'),
      createNavEvent('http://example.com/page'),
      createLoadEvent('1'),
      createNavEvent('http://example.com/other')
    ];
    const section = createEventSection(events);
    const result = stripDuplicateNavigationsSection(section);
    expect(result.events).toEqual([
      events[0], // First navigation event
      events[2], // Load event
      events[3]  // Navigation event after load
    ]);
  });

  it('should preserve navigation events separated by other events', () => {
    const events = [
      createNavEvent('http://example.com'),
      createLoadEvent('1'),
      createNavEvent('http://example.com/page'),
      createLoadEvent('2'),
      createNavEvent('http://example.com/other')
    ];
    const section = createEventSection(events);
    const result = stripDuplicateNavigationsSection(section);
    expect(result.events).toEqual(events);
  });

  it('should handle nested sections', () => {
    const nestedSection = createEventSection([
      createNavEvent('http://example.com/nested'),
      createNavEvent('http://example.com/nested/page'),
      createLoadEvent('nested')
    ]);

    const events = [
      createNavEvent('http://example.com'),
      nestedSection,
      createLoadEvent('1'),
      createNavEvent('http://example.com/other')
    ];

    const section = createEventSection(events);
    const result = stripDuplicateNavigationsSection(section);

    // The nested section should have consecutive navigations removed
    const expectedNestedEvents = [
      createNavEvent('http://example.com/nested'),
      createLoadEvent('nested')
    ];

    expect(result.events).toEqual([
      events[0], // First navigation
      { ...nestedSection, events: expectedNestedEvents }, // Nested section with filtered events
      events[2], // Load event
      events[3]  // Last navigation
    ]);
  });

  it('should handle deeply nested sections', () => {
    const deepestSection = createEventSection([
      createLoadEvent('deepest'),
      createNavEvent('http://deep/1'),
      createNavEvent('http://deep/2'),
    ]);

    const middleSection = createEventSection([
      createNavEvent('http://middle/1'),
      deepestSection,
      createNavEvent('http://middle/2'),
    ]);

    const events = [
      createNavEvent('http://root/1'),
      createNavEvent('http://root/2'),
      middleSection,
    ];

    const section = createEventSection(events);
    const result = stripDuplicateNavigationsSection(section);

    // Expected structure after stripping duplicates at each level
    const expectedDeepest = createEventSection([
      createLoadEvent('deepest'),
      createNavEvent('http://deep/1'),
    ]);

    const expectedMiddle = createEventSection([
      createNavEvent('http://middle/1'),
      expectedDeepest,
      createNavEvent('http://middle/2'),
    ]);

    expect(result.events).toEqual([
      createNavEvent('http://root/1'),
      expectedMiddle,
    ]);
  });
});
const timestamp = Date.now()
const createEventSection = (events: (AnyEvent|EventSection)[] = []) => ({
  section: 'Initial',
  events
} as EventSection);

const createNavEvent = (url: string): NavigationEvent => ({
  type: 'navigation',
  to: url,
  timestamp
} as NavigationEvent);

const createLoadEvent = (id: string): LoadEvent => ({
  type: 'load',
  id,
  timestamp
} as LoadEvent);
