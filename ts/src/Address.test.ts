import {IsValidAddress, NormalizeAddress, IsValidReferrerId } from './Address';

test('basic', () => {

	expect(IsValidAddress('0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4')).toBe(true);
	expect(IsValidAddress('2fe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBe(true);

	// Different length
	expect(IsValidAddress('0a2fe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBe(false);
	expect(IsValidAddress('0xffe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBe(true);
	// invalid char
	expect(IsValidAddress('0xffe3xbf59a777e8f4be4e712945ffefc6612d46f')).toBe(false);

	const normAddress = NormalizeAddress('2fe3cbf59a777e8f4be4e712945ffefc6612d46f');
	expect(/^0x[A-G0-9]{40}$/i.test(normAddress)).toBe(true);

	expect(IsValidReferrerId('7k5y8w')).toBe(true);
	expect(IsValidReferrerId('7K5y8W')).toBe(true);
	expect(IsValidReferrerId('7K5y8W')).toBe(true);
	
	// Verify failure cases
	expect(IsValidReferrerId('75y8W')).toBe(false);	// Too short
	expect(IsValidReferrerId('xx75y8W')).toBe(false);	// Too Long
	expect(IsValidReferrerId('7u5y8W')).toBe(false);	// I
	expect(IsValidReferrerId('7i5y8W')).toBe(false);	// O
	expect(IsValidReferrerId('7o3y8W')).toBe(false);	// U
	expect(IsValidReferrerId('7l3y8W')).toBe(false);	// L
  });
  