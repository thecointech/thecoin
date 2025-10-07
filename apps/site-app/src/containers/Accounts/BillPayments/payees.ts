import { DropdownItemProps } from 'semantic-ui-react';
import { number as cardValidatorNumber } from 'card-validator';
import { defineMessages } from 'react-intl';
import type { MessageWithValues } from '@thecointech/shared/types';

const translations = defineMessages({
  missingData : {
    defaultMessage: 'Please select payee and enter account number',
    description: 'Bill payment error message when missing payee or account'},
  invalidVisaChars : {
      defaultMessage: 'Your card number should be 16 digits long',
      description: 'app.accounts.billPayments.invalidVisaChars: Error message for the bill payement page'},
  invalidVisaAccount : {
      defaultMessage: 'The given number is not a valid visa card',
      description: 'app.accounts.billPayments.invalidVisaAccount: Error message for the bill payement page'},
  invalidNumericLength : {
      defaultMessage: 'You have entered {len} numbers, but your account requires {max}',
      description: 'app.accounts.billPayments.invalidNumericChars: Error message for the bill payement page'},
  invalidNumericChars : {
        defaultMessage: 'Your account id should only contain numbers',
        description: 'Invalid characters entered for bill payee'},
});

export type Validatable = {
  validate: (value: string) => MessageWithValues|null,
  parameter?: any,
}
type ValidatedItemProps = DropdownItemProps & Validatable;

function none(_: string) { return null; }

function visa(val: string) {
  var n = parseInt(val);
  if (n!==n || val.length !== 16)
    return translations.invalidVisaChars

	const r = cardValidatorNumber(val);
  return (r.isValid && !!r.card && r.card.type === 'visa')
    ? null
    : translations.invalidVisaAccount
}

function numeric(max: number) {
  return (val: string) => {
    const onlyNumbers = /^\d+$/;
    if (!onlyNumbers.test(val)) return translations.invalidNumericChars
    return (val.length !== max)
    ?
      {
        ...translations.invalidNumericLength,
        values: {
          len: val.length,
          max
        }
      }
    : null
  }
}

export type LegalPayeeName = typeof payees[number]['value'];
export function findPayee(value: string) {
  const item = payees.find(item => item.value === value)
  return item;
}

export function validate(name?: string, value?: string) : MessageWithValues|null
{
  if (!name || !value)
    return translations.missingData
  const payee = findPayee(name);
  return payee?.validate(value) ?? null;
}

export const payees = [
	{ validate: visa, text: "BEST BUY REWARD ZONE VISA", value: "BEST BUY REWARD ZONE VISA" },
	{ validate: visa, text: "CANADA POST VISA CARD", value: "CANADA POST VISA CARD" },
	{ validate: visa, text: "CANADIAN WESTERN BK VISA COLLABRIA", value: "CANADIAN WESTERN BK VISA COLLABRIA" },
	{ validate: visa, text: "CARTE BRICK VISA DESJARDINS", value: "CARTE BRICK VISA DESJARDINS" },
	{ validate: visa, text: "CITIZENS BANK PREPAID VISA", value: "CITIZENS BANK PREPAID VISA" },
	{ validate: visa, text: "COLLABRIA VISA", value: "COLLABRIA VISA" },
	{ validate: visa, text: "ELAN FINANCIAL SERVICES - VISA", value: "ELAN FINANCIAL SERVICES - VISA" },
	{ validate: visa, text: "ICICI BANK CANADA VISA", value: "ICICI BANK CANADA VISA" },
	{ validate: visa, text: "LEON'S VISA DESJARDINS", value: "LEON'S VISA DESJARDINS" },
	{ validate: visa, text: "MANULIFE BANK VISA", value: "MANULIFE BANK VISA" },
	{ validate: visa, text: "MBNA VISA", value: "MBNA VISA" },
	{ validate: visa, text: "MERIDIAN VISA", value: "MERIDIAN VISA" },
	{ validate: visa, text: "MOGO VISA", value: "MOGO VISA" },
	{ validate: visa, text: "NEXTWAVE TITANIUM PLUS VISA", value: "NEXTWAVE TITANIUM PLUS VISA" },
	{ validate: visa, text: "SCOTIABANK PREPAID VISA", value: "SCOTIABANK PREPAID VISA" },
	{ validate: visa, text: "SIMPLII FINANCIAL CASH BACK VISA", value: "SIMPLII FINANCIAL CASH BACK VISA" },
	{ validate: visa, text: "US BANK CANADA - VISA", value: "US BANK CANADA - VISA" },
	{ validate: visa, text: "VANCITY COM. INV. BANK VISA", value: "VANCITY COM. INV. BANK VISA" },
	{ validate: visa, text: "VANCITY PREPAID VISA", value: "VANCITY PREPAID VISA" },
	{ validate: visa, text: "VISA - BANK OF AMERICA CANADA", value: "VISA - BANK OF AMERICA CANADA" },
	{ validate: visa, text: "VISA - CIBC", value: "VISA - CIBC" },
	{ validate: visa, text: "VISA - HOME TRUST", value: "VISA - HOME TRUST" },
	{ validate: visa, text: "VISA - TORONTO DOMINION", value: "VISA - TORONTO DOMINION" },
	{ validate: visa, text: "VISA ROYAL BANK", value: "VISA ROYAL BANK" },
	{ validate: visa, text: "VISA-FIRSTLINE", value: "VISA-FIRSTLINE" },
	{ validate: visa, text: "VISA-SCOTIABANK AND SCOTIALINE VISA", value: "VISA-SCOTIABANK AND SCOTIALINE VISA" },
	{ validate: visa, text: "VISA-VANCITY", value: "VISA-VANCITY" },
	{ validate: visa, text: "VISA, DESJARDINS", value: "VISA, DESJARDINS" },
	{ validate: visa, text: "VISA, LAURENTIAN BANK", value: "VISA, LAURENTIAN BANK" },
	{ validate: visa, text: "WE FINANCIAL VISA PREPAID", value: "WE FINANCIAL VISA PREPAID" },
	{ validate: visa, text: "YES PREPAID VISA CARD", value: "YES PREPAID VISA CARD" },
	{ validate: none, text: "REVENU QUEBEC BALANCE DUE - 2018", value: "REVENU QUEBEC BALANCE DUE - 2018" },
	{ validate: none, text: "REVENU QUEBEC SUPPORT PAYMENTS", value: "REVENU QUEBEC SUPPORT PAYMENTS" },
	{ validate: none, text: "REVENUE QUEBEC TAX INSTALMENT 2019", value: "REVENUE QUEBEC TAX INSTALMENT 2019" },
	{ validate: none, text: "CRA (REVENUE) TAX AMOUNT OWING", value: "CRA (REVENUE) TAX AMOUNT OWING" },
	{ validate: none, text: "CRA (REVENUE) 2018 TAX RETURN", value: "CRA (REVENUE) 2018 TAX RETURN" },
	{ validate: none, text: "CRA CHILD AND FAMILY BENEFITS", value: "CRA CHILD AND FAMILY BENEFITS" },
  { validate: none, text: "CRA REVENUE TAX INSTALMENT", value: "CRA REVENUE TAX INSTALMENT" },
  { validate: numeric(14), text: "MANITOBA HYDRO", value: "MANITOBA HYDRO - 14 DIGIT ACCT" },
  { validate: numeric(9), text: "FIDO", value: "FIDO" },
  { validate: numeric(11), text: "ENERGIR", value: "ENERGIR" }
] as const satisfies readonly ValidatedItemProps[];

