import {IsValidAddress, NormalizeAddress, IsValidShortCode, AddressMatches } from './Address';

test('basic', () => {

	expect(IsValidAddress('0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4')).toBe(true);
	expect(IsValidAddress('2fe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBe(true);

	// Different length
	expect(IsValidAddress('0a2fe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBe(false);
	expect(IsValidAddress('0xffe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBe(true);
	// invalid char
	expect(IsValidAddress('0xffe3xbf59a777e8f4be4e712945ffefc6612d46f')).toBe(false);
	// Ethers refuses addresses with uppercase X
	expect(IsValidAddress('0XCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4')).toBe(false);

	const normAddressShort = NormalizeAddress('2fe3cbf59a777e8f4be4e712945ffefc6612d46f');
	expect(/^0x[A-G0-9]{40}$/.test(normAddressShort)).toBe(true);
	const normAddressLong = NormalizeAddress('0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f');
	expect(/^0x[A-G0-9]{40}$/.test(normAddressLong)).toBe(true);

	expect(IsValidShortCode('7k5y8w')).toBe(true);
	expect(IsValidShortCode('7K5y8W')).toBe(true);
	expect(IsValidShortCode('7K5y8W')).toBe(true);

	// Verify failure cases
	expect(IsValidShortCode('75y8W')).toBe(false);	// Too short
	expect(IsValidShortCode('xx75y8W')).toBe(false);	// Too Long
	expect(IsValidShortCode('7u5y8W')).toBe(false);	// I
	expect(IsValidShortCode('7i5y8W')).toBe(false);	// O
	expect(IsValidShortCode('7o3y8W')).toBe(false);	// U
	expect(IsValidShortCode('7l3y8W')).toBe(false);	// L

	const uc = "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4";
	const lc = uc.toLowerCase();
	expect(AddressMatches(uc, lc)).toBeTruthy();
	expect(AddressMatches(uc, '0xffe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBeFalsy();
  });
