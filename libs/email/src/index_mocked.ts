import { log } from '@thecointech/logging';
import shim from '@thecointech/jestutils/shim';

// Set log.level(20) to test if things are breaking.
export const SendMail = shim.jest.fn((subject: string, message: string) => {
  log.debug(`Sending Mail: \nsubject: ${subject}\nmessage:\n${message}`);
  return Promise.resolve(true);
});
export const SendDepositConfirmation = shim.jest.fn(() => Promise.resolve(true));
export const SendWelcomeEmail = shim.jest.fn(() => Promise.resolve(true));
