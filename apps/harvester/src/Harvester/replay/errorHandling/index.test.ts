import { findLastInteraction } from ".";

const zeroCoords = { top: 0, left: 0, centerY: 0, height: 0, width: 0 };

const navToLogin = { type: 'navigation', id: 'nav-login', timestamp: 1, to: 'https://example.com/login' } as any;
const loginInput = { type: 'input', id: 'input-user', timestamp: 2, eventName: 'username', value: 'user', valueChange: true, tagName: 'INPUT', role: null, selector: 'input#user', coords: zeroCoords, label: 'User', text: '' } as any;
const loginClick = { type: 'click', id: 'click-login', timestamp: 3, eventName: 'clicked', clickX: 0, clickY: 0, tagName: 'BUTTON', role: null, selector: 'button#login', coords: zeroCoords, label: '', text: 'Log in' } as any;
const balanceValue = { type: 'value', id: 'value-balance', timestamp: 4, eventName: 'balance', tagName: 'SPAN', role: null, selector: 'span#balance', coords: zeroCoords, label: '', text: '$100.00' } as any;
const navToAccounts = { type: 'navigation', id: 'nav-accounts', timestamp: 5, to: 'https://example.com/accounts' } as any;

it('finds the last interaction when the target event is an interaction', () => {
  const events = [navToLogin, loginInput, loginClick, balanceValue];
  const last = findLastInteraction(events, balanceValue);
  expect(last).toBe(loginClick);
});

it('finds the previous interaction when the target event is not an interaction', () => {
  const events = [navToLogin, loginInput, loginClick, balanceValue, navToAccounts];
  const last = findLastInteraction(events, navToAccounts);
  expect(last).toBe(balanceValue);
});

it('returns undefined when no interaction exists before the target event', () => {
  const events = [navToLogin, navToAccounts];
  const last = findLastInteraction(events, navToAccounts);
  expect(last).toBeUndefined();
});

it('returns undefined when the target event is not in the array', () => {
  const events = [navToLogin, loginInput];
  const orphan = { ...loginClick, id: 'unknown' };
  const last = findLastInteraction(events, orphan as any);
  expect(last).toBeUndefined();
});
