import { getCronSchedule } from './scheduler-linux';

it ('calculates a cron schedule', () => {
    const s = getCronSchedule({ 
        daysToRun: [false, true, false, false, true, false, false], 
        timeToRun: '23:59' 
    });
    expect(s).toEqual('59 23 * * 1,5')
})

// Do not run this test in CI
// if (process.platform === 'linux') {
//     it('creates a new job', async () => {
//         await setSchedule({
//             daysToRun: [false, true, false, false, true, false, false],
//             timeToRun: '23:59'
//         });
//     })
// }
