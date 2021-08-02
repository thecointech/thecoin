import { log } from '@thecointech/logging';
import { jest } from '@thecointech/jestutils/shim';

// Set log.level(20) to test if things are breaking.
export const SendMail = jest.fn((subject: string, message: string) => {
  log.debug(`Sending Mail: \nsubject: ${subject}\nmessage:\n${message}`);
  return Promise.resolve(true);
});
export const SendDepositConfirmation = jest.fn(() => Promise.resolve(true));
export const SendWelcomeEmail = jest.fn(() => Promise.resolve(true));
