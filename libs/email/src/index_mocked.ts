import { log } from '@thecointech/logging';
// import shim from '@thecointech/jestutils/shim';

// Set log.level(20) to test if things are breaking.
export const SendMail = (subject: string, message: string) => {
  log.debug(`Sending Mail: \nsubject: ${subject}\nmessage:\n${message}`);
  return Promise.resolve(true);
};
export const SendDepositConfirmation = () => Promise.resolve(true);
export const SendWelcomeEmail = () => Promise.resolve(true);
