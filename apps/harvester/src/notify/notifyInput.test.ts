import { notifyInput } from './notifyInput';
import { IsManualRun, describe } from '@thecointech/jestutils';


describe('test notifyInput', () => {
  it('can ask for user input', async () => {
    // Enable askForInput in test mode
    process.env.TEST_ASK_INPUT = 'true';

    const result = await notifyInput('Enter your 2FA code:');
    console.log('User entered:', result);

    // We can't assert a specific value since it depends on what user types
    // Just verify it returns a string or null
    expect(result === null || typeof result === 'string').toBe(true);

    delete process.env.TEST_ASK_INPUT;
  })
}, IsManualRun)
