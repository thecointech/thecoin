/**
 * Simple library wraps mailjet for single-source type-safe sending of templates etc.
 */

import { DateTime } from 'luxon';
import { SendMail, SendTemplate } from './AutoMailer';

export type DepositConfirmationVariables = {
  tx: string,
  ProcessDate: DateTime,
  SendDate: DateTime,
  FirstName: string,
}

export type WelcomeConfirmVariables = {
  confirmUrl: string
}

export enum TemplateId {
  WelcomeConfirm = 1029944,
  DepositConfirmation = 1703237,
}

export const SendDepositConfirmation = (to: string, vars: DepositConfirmationVariables) =>
  SendTemplate(to, TemplateId.DepositConfirmation, {
    ...vars,
    SendDate: vars.SendDate.toFormat("LLL dd, H:mm"),
    ProcessDate: vars.ProcessDate.toFormat("LLL dd, H:mm"),
  });

export const SendWelcomeEmail = (to: string, id: string) =>
  SendTemplate(to, TemplateId.WelcomeConfirm, {
    confirmUrl: "https://thecoin.io/#/newsletter/confirm?id=" + encodeURI(id)
  });

export { SendMail };
