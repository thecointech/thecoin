import { jest } from '@jest/globals';
import { describe, IfPolygonscanLive } from '@thecointech/jestutils';
import { getEnvVars } from "@thecointech/setenv";
import { getModifier } from '../internal/common';
import { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider/web';

const prodVars = getEnvVars('prod');
jest.setTimeout(60000);

describe('Works with remote plugins', () => {

  const OLD_ENV = process.env;
  beforeEach(() => process.env = prodVars);
  afterAll(() => process.env = OLD_ENV);

  it('Fetches code from remote & runs it', async () => {
    // Test that we can fetch & compile UberConverter
    // Force use of remote things
    const converterAddress = "0x70da7D05Ee936E583A5165c62A1DEd3Cb0A07C82";
    const provider = new Erc20Provider();
    const modifier = await getModifier(converterAddress, provider);
    expect(modifier).toBeTruthy();

    const rfiat = modifier(1000e2, 0);
    expect(rfiat.toNumber()).toBe(1000e2);
  });
}, await IfPolygonscanLive());
