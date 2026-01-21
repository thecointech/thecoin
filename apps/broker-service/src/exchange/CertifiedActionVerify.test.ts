import { jest } from '@jest/globals';
import { validateUberAction } from './CertifiedActionVerify';
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import { Wallet } from 'ethers';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';

describe('validateUberAction', () => {

    // Helper to create a transfer object with minimal required fields
    const wallet = Wallet.createRandom();
    const brokerAddress = process.env.WALLET_BrokerCAD_ADDRESS!;
    const createTransfer = (at: DateTime) => BuildUberAction({} as any, wallet, brokerAddress, new Decimal(100), 124, at);

    const now = DateTime.now();
    const oldTime = now.minus({ minutes: 5 });
    const recentTime = now.minus({ minutes: 1 });

    // Store original env
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('should return true for recent transfer', async () => {
        const transfer = await createTransfer(recentTime);
        const result = await validateUberAction(transfer);
        expect(result).toBe(true);
    });

    test('should throw for old transfer in default env', async () => {
        const transfer = await createTransfer(oldTime);
        process.env.CONFIG_NAME = 'prod'; // Ensure strict mode
        await expect(validateUberAction(transfer)).rejects.toThrow();
    });

    test('should return true for old transfer in prodtest env', async () => {
        const transfer = await createTransfer(oldTime);
        process.env.CONFIG_NAME = 'prodtest';
        await expect(validateUberAction(transfer)).resolves.toBe(true);
    });
});
