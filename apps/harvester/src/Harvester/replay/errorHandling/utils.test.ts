import { findSectionByName, findSectionByEvent } from './utils';
import { flatten } from '@thecointech/scraper-agent/replay/events';
import type { EventSection } from '@thecointech/scraper-agent/types';

const zeroCoords = { top: 0, left: 0, centerY: 0, height: 0, width: 0 };

const navToLogin = { type: 'navigation', id: 'nav-login', timestamp: 1, to: 'https://example.com/login' } as any;
const loginInput = { type: 'input', id: 'input-user', timestamp: 2, eventName: 'username', value: 'user', valueChange: true, tagName: 'INPUT', role: null, selector: 'input#user', coords: zeroCoords, label: 'User', text: '' } as any;
const loginClick = { type: 'click', id: 'click-login', timestamp: 3, eventName: 'clicked', clickX: 0, clickY: 0, tagName: 'BUTTON', role: null, selector: 'button#login', coords: zeroCoords, label: '', text: 'Log in' } as any;
const balanceValue = { type: 'value', id: 'value-balance', timestamp: 4, eventName: 'balance', tagName: 'SPAN', role: null, selector: 'span#balance', coords: zeroCoords, label: '', text: '$100.00' } as any;

const root: EventSection = {
  section: 'Initial',
  events: [
    navToLogin,
    {
      section: 'Login',
      events: [loginInput, loginClick],
    },
    {
      section: 'AccountsSummary',
      events: [balanceValue],
    },
  ],
};

it('finds the right section by name', () => {
  const section = findSectionByName('Login', root);
  expect(section).toBeDefined();
  expect(section?.section).toBe('Login');
});

it('finds the right section by event', () => {
  const section = findSectionByEvent(loginClick, root);
  expect(section).toBeDefined();
  expect(section?.section).toBe('Login');
});

it('finds the right section by event id even when the event is a copy', () => {
  // getReplayEvents/flatten stamps a section on events that did not have one,
  // producing a shallow copy. findSectionByEvent must match by id, not identity.
  const copied = { ...loginClick, section: 'Login' };
  const section = findSectionByEvent(copied as any, root);
  expect(section).toBeDefined();
  expect(section?.section).toBe('Login');
});

it('returns null for an event that is not in the tree', () => {
  const orphan = { ...loginClick, id: 'unknown' };
  const section = findSectionByEvent(orphan as any, root);
  expect(section).toBeNull();
});

it('returns null for a missing section name', () => {
  const section = findSectionByName('Logout', root);
  expect(section).toBeNull();
});

it('returns null when the search event is null', () => {
  expect(findSectionByEvent(null as any, root)).toBeNull();
});

it('matches a flattened event that had its section stamped (the real bug)', () => {
  // Events without a section property are copied and stamped by flatten.
  const flat = flatten(root, ['Login', 'AccountsSummary']);
  const flatLoginClick = flat.find(e => e.id === 'click-login');
  expect(flatLoginClick).toBeDefined();
  expect(flatLoginClick).not.toBe(loginClick);
  const section = findSectionByEvent(flatLoginClick, root);
  expect(section?.section).toBe('Login');
});

it('finds an event in a deeply nested section', () => {
  const twoFaInput = { type: 'input', id: 'input-otp', timestamp: 5, eventName: 'otp', value: '123456', valueChange: true, tagName: 'INPUT', role: null, selector: 'input#otp', coords: zeroCoords, label: 'Code', text: '' } as any;
  const deepRoot: EventSection = {
    section: 'Initial',
    events: [
      {
        section: 'Login',
        events: [
          {
            section: 'TwoFA',
            events: [twoFaInput],
          },
        ],
      },
    ],
  };
  const section = findSectionByEvent(twoFaInput, deepRoot);
  expect(section?.section).toBe('TwoFA');
});

