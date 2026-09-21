import { DateTime } from "luxon";
import { getDemoCheckpoint, getEmulatedVisaData } from "./testDemoAccountEmulation";

it ('matches visa steps from initDemoAccount', () => {

    const testEmulator = (date: string, expbalance: number, dueDate: string) => {
        const visa0 = getEmulatedVisaData(DateTime.fromISO(date));
        expect(visa0.dueDate.toSQLDate()).toBe(dueDate);
        expect(visa0.balance.value).toBe(expbalance);
    }

    // First week
    testEmulator('2024-02-26', 1575, '2024-03-18'); // Monday
    testEmulator('2024-02-27', 1575, '2024-03-18');
    testEmulator('2024-02-28', 1575, '2024-03-18');
    testEmulator('2024-02-29', 1750, '2024-03-18'); // Thursday
    testEmulator('2024-03-01', 1750, '2024-03-18');
    testEmulator('2024-03-02', 1750, '2024-03-18');
    testEmulator('2024-03-03', 1750, '2024-03-18');
    testEmulator('2024-03-04', 1925, '2024-03-18'); // Monday

    // When the first due date passes
    testEmulator('2024-03-13', 2275, '2024-03-18'); // Wed
    testEmulator('2024-03-14', 2450, '2024-03-18'); // Thurs
    testEmulator('2024-03-17', 2450, '2024-03-18'); // Sunday
    testEmulator('2024-03-18', 1225, '2024-03-18'); // Monday - 175 in, 1400 out
    testEmulator('2024-03-19', 1225, '2024-03-18'); // Tues
    testEmulator('2024-03-20', 1225, '2024-03-18'); // Wed

    // First billing period ends
    testEmulator('2024-03-24', 1400, '2024-03-18'); // Sun
    testEmulator('2024-03-25', 1575, '2024-04-15'); // Mon - 175 in, end of billing period
    testEmulator('2024-03-26', 1575, '2024-04-15'); // Tues
    testEmulator('2024-03-27', 1575, '2024-04-15'); // Wed
    testEmulator('2024-03-28', 1750, '2024-04-15'); // Thurs

    testEmulator('2024-04-07', 2100, '2024-04-15'); // Thurs
    testEmulator('2024-06-06', 2450, '2024-06-10'); // Thurs

})

describe('getDemoCheckpoint', () => {
    it('includes a payment pending before its due date', () => {
        const date = DateTime.fromISO('2024-03-17T12:00:00');
        const checkpoint = getDemoCheckpoint(date);

        expect(checkpoint.date).toBe(date);
        expect(checkpoint.harvesterBalance.value).toBe(2450);
        expect(checkpoint.pendingPayment?.amount.value).toBe(1400);
        expect(checkpoint.pendingPayment?.date.toISODate()).toBe('2024-03-18');
        expect(checkpoint.visa.dueDate.toISODate()).toBe('2024-03-18');
    });

    it('reflects a settled payment on its due date', () => {
        const checkpoint = getDemoCheckpoint(DateTime.fromISO('2024-03-18T12:00:00'));

        expect(checkpoint.harvesterBalance.value).toBe(1225);
        expect(checkpoint.pendingPayment).toBeUndefined();
        expect(checkpoint.visa.history[0].date.toISODate()).toBe('2024-03-18');
        expect(checkpoint.visa.history[0].values[0].value).toBe(1400);
    });

    it('includes the next payment when the billing period advances', () => {
        const checkpoint = getDemoCheckpoint(DateTime.fromISO('2024-03-25T12:00:00'));

        expect(checkpoint.harvesterBalance.value).toBe(1575);
        expect(checkpoint.pendingPayment?.amount.value).toBe(1400);
        expect(checkpoint.pendingPayment?.date.toISODate()).toBe('2024-04-15');
    });

    it('preserves the deposit when a payment settles on the same day', () => {
        const prior = getDemoCheckpoint(DateTime.fromISO('2024-03-17T12:00:00'));
        const checkpoint = getDemoCheckpoint(DateTime.fromISO('2024-03-18T12:00:00'));
        const settledPayment = prior.pendingPayment && !checkpoint.pendingPayment
            ? prior.pendingPayment.amount
            : 0;
        const toDeposit = checkpoint.harvesterBalance
            .subtract(prior.harvesterBalance)
            .add(settledPayment);

        expect(toDeposit.value).toBe(175);
    });
});

it ('emulates appropriate history', () => {
    const testHistory = (date: string, lastTxDate: string) => {
        const { history } = getEmulatedVisaData(
            DateTime.fromISO(date),
            DateTime.fromISO(lastTxDate)
        );
        expect(history.length).toEqual(1);
        expect(history[0].date.toSQLDate()).toEqual('2024-03-18');
        expect(history[0].values[0].value).toEqual(1400);
    }
    testHistory('2024-03-18', '2024-03-14'); // Runs on clearance day
    testHistory('2024-03-19', '2024-03-14'); // Runs after clearance day
})
