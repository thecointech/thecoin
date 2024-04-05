import { DateTime } from "luxon";
import { getChequingData, getEmulatedVisaData } from "./fetchData";

it ('has sufficient chq balance', async () => {
    const chq = await getChequingData();
    expect(chq.balance.intValue).toBeGreaterThan(1000);
})

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
})

it ('emulates appropriate history', () => {
    const testHistory = (date: string, lastTxDate: string) => {
        const { history } = getEmulatedVisaData(
            DateTime.fromISO(date), 
            DateTime.fromISO(lastTxDate)
        );
        expect(history.length).toEqual(1);
        expect(history[0].date.toSQLDate()).toEqual('2024-03-18');
        expect(history[0].credit?.value).toEqual(1400);
    }
    testHistory('2024-03-18', '2024-03-14'); // Runs on clearance day
    testHistory('2024-03-19', '2024-03-14'); // Runs after clearance day
})