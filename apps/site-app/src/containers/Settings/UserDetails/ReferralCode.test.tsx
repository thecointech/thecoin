import React from 'react';
import { render as renderComponent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { DateTime } from 'luxon';
import type { BasicDetails } from '@thecointech/account-details';
import { ReferralCode } from './ReferralCode';

const render = (basic?: BasicDetails) => renderComponent(
  <IntlProvider locale="en"><ReferralCode basic={basic} /></IntlProvider>
).container.textContent;

const approved: BasicDetails = { status: 'approved', statusUpdated: DateTime.now() };

it('shows the assigned referral code', () => {
  expect(render({ ...approved, referralStatus: 'assigned', referralCode: 'TESTCODE' })).toContain('TESTCODE');
});

it('shows pending assignment while a code is being generated', () => {
  expect(render({ ...approved, referralStatus: 'pending' })).toContain('We are generating your code');
});

it('does not promise a code for a duplicate identity', () => {
  const result = render({ ...approved, referralStatus: 'duplicate' });
  expect(result).toContain('This identity has already been assigned a referral code');
  expect(result).not.toContain('We are generating your code');
});

it('asks unverified accounts to verify', () => {
  expect(render()).toContain('You need to verify your account');
});
