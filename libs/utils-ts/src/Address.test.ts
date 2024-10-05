import { IsValidAddress, NormalizeAddress, IsValidShortCode, getAddressShortCode, AddressMatches, getShortCode } from './Address';
import { Wallet } from "ethers";

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

    const signature = '0x909c440aad7215f4d0b7126cae0de28619d8dff559124e163cbb36959d5247491e1f1f99430e2d6c29ebfdee764791cb2a85fe92115dc17cb9981a61d369a8e01c'
    // generates: "j2e482nde8az9m5q29paw3f2grcxhqznb494w5hwqcv9b7aj8x4hw7rzk51gwbbc57nzvvkp8y8wpam5zu912qe1fjwtg6k1udmuhr0w"
    let offset = 0;
    expect(getShortCode(signature, offset++)).toEqual("muhr0w");
    expect(getShortCode(signature, offset++)).toEqual("dmuhr0");
    expect(getShortCode(signature, offset++)).toEqual("udmuhr");
    expect(getShortCode(signature, offset++)).toEqual("1udmuh");
    expect(getShortCode(signature, offset++)).toEqual("k1udmu");
    expect(getShortCode(signature, offset++)).toEqual("6k1udm");
    expect(getShortCode(signature, offset++)).toEqual("g6k1ud");

    // The code generated here appears to contain a 'u'
    const code = getShortCode(signature);
    expect(IsValidShortCode(code)).toBe(true);

    expect(IsValidShortCode('7k5y8w')).toBe(true);
    expect(IsValidShortCode('7K5y8W')).toBe(true);
    expect(IsValidShortCode('7K5y8W')).toBe(true);

    // Verify failure cases
    expect(IsValidShortCode('75y8W')).toBe(false);	// Too short
    expect(IsValidShortCode('xx75y8W')).toBe(false);	// Too Long
    expect(IsValidShortCode('7s5y8W')).toBe(false);	// S
    expect(IsValidShortCode('7i5y8W')).toBe(false);	// I
    expect(IsValidShortCode('7o3y8W')).toBe(false);	// O
    expect(IsValidShortCode('7l3y8W')).toBe(false);	// L

    const uc = "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4";
    const lc = uc.toLowerCase();
    expect(AddressMatches(uc, lc)).toBeTruthy();
    expect(AddressMatches(uc, '0xffe3cbf59a777e8f4be4e712945ffefc6612d46f')).toBeFalsy();
});

// Test Fix - failed deposits due to changed short-code
it("generates consistent short code", async () => {
    // Use a random wallet to test code generation
    const wallet = Wallet.fromPhrase('payment moment extend talk annual shell dry speak cluster vacant afford luggage');
    console.log(wallet.address)
    const shortCode = await getAddressShortCode(wallet.address, wallet);
    expect(shortCode).toEqual('xd9p8v');
})
