import { DropdownItemProps } from 'semantic-ui-react';
import { number } from 'card-validator';

export type types = "visa"|"none"
interface ValidatedItemProps extends DropdownItemProps {
	type: types
}

function validateVisa(val: string) {
	const r = number(val);
	return r.isValid && !!r.card && r.card.type === 'visa';
}

function findType(text: string): types {
	const item = payees.find(item => item.text === text)
	return item ? item.type : "none"
}

export function validate(name: string, value: string)
{
	switch(findType(name))
	{
		case "visa": return validateVisa(value);
		case "none": return true;
	}
	return false;
}

export const payees: ValidatedItemProps[] = [
	{ type: "visa", text: "BEST BUY REWARD ZONE VISA", value: "BEST BUY REWARD ZONE VISA" },
	{ type: "visa", text: "CANADA POST VISA CARD", value: "CANADA POST VISA CARD" },
	{ type: "visa", text: "CANADIAN WESTERN BK VISA COLLABRIA", value: "CANADIAN WESTERN BK VISA COLLABRIA" },
	{ type: "visa", text: "CARTE BRICK VISA DESJARDINS", value: "CARTE BRICK VISA DESJARDINS" },
	{ type: "visa", text: "CITIZENS BANK PREPAID VISA", value: "CITIZENS BANK PREPAID VISA" },
	{ type: "visa", text: "COLLABRIA VISA", value: "COLLABRIA VISA" },
	{ type: "visa", text: "ELAN FINANCIAL SERVICES - VISA", value: "ELAN FINANCIAL SERVICES - VISA" },
	{ type: "visa", text: "ICICI BANK CANADA VISA", value: "ICICI BANK CANADA VISA" },
	{ type: "visa", text: "LEON'S VISA DESJARDINS", value: "LEON'S VISA DESJARDINS" },
	{ type: "visa", text: "MANULIFE BANK VISA", value: "MANULIFE BANK VISA" },
	{ type: "visa", text: "MBNA VISA", value: "MBNA VISA" },
	{ type: "visa", text: "MERIDIAN VISA", value: "MERIDIAN VISA" },
	{ type: "visa", text: "MOGO VISA", value: "MOGO VISA" },
	{ type: "visa", text: "NEXTWAVE TITANIUM PLUS VISA", value: "NEXTWAVE TITANIUM PLUS VISA" },
	{ type: "visa", text: "SCOTIABANK PREPAID VISA", value: "SCOTIABANK PREPAID VISA" },
	{ type: "visa", text: "SIMPLII FINANCIAL CASH BACK VISA", value: "SIMPLII FINANCIAL CASH BACK VISA" },
	{ type: "visa", text: "US BANK CANADA - VISA", value: "US BANK CANADA - VISA" },
	{ type: "visa", text: "VANCITY COM. INV. BANK VISA", value: "VANCITY COM. INV. BANK VISA" },
	{ type: "visa", text: "VANCITY PREPAID VISA", value: "VANCITY PREPAID VISA" },
	{ type: "visa", text: "VISA - BANK OF AMERICA CANADA", value: "VISA - BANK OF AMERICA CANADA" },
	{ type: "visa", text: "VISA - CIBC", value: "VISA - CIBC" },
	{ type: "visa", text: "VISA - HOME TRUST", value: "VISA - HOME TRUST" },
	{ type: "visa", text: "VISA - TORONTO DOMINION", value: "VISA - TORONTO DOMINION" },
	{ type: "visa", text: "VISA ROYAL BANK", value: "VISA ROYAL BANK" },
	{ type: "visa", text: "VISA-FIRSTLINE", value: "VISA-FIRSTLINE" },
	{ type: "visa", text: "VISA-SCOTIABANK AND SCOTIALINE VISA", value: "VISA-SCOTIABANK AND SCOTIALINE VISA" },
	{ type: "visa", text: "VISA-VANCITY", value: "VISA-VANCITY" },
	{ type: "visa", text: "VISA, DESJARDINS", value: "VISA, DESJARDINS" },
	{ type: "visa", text: "VISA, LAURENTIAN BANK", value: "VISA, LAURENTIAN BANK" },
	{ type: "visa", text: "WE FINANCIAL VISA PREPAID", value: "WE FINANCIAL VISA PREPAID" },
	{ type: "visa", text: "YES PREPAID VISA CARD", value: "YES PREPAID VISA CARD" },
	{ type: "none", text: "REVENU QUEBEC BALANCE DUE - 2018", value: "REVENU QUEBEC BALANCE DUE - 2018" },
	{ type: "none", text: "REVENU QUEBEC SUPPORT PAYMENTS", value: "REVENU QUEBEC SUPPORT PAYMENTS" },
	{ type: "none", text: "REVENUE QUEBEC TAX INSTALMENT 2019", value: "REVENUE QUEBEC TAX INSTALMENT 2019" },
	{ type: "none", text: "CRA (REVENUE) TAX AMOUNT OWING", value: "CRA (REVENUE) TAX AMOUNT OWING" },
	{ type: "none", text: "CRA (REVENUE) 2018 TAX RETURN", value: "CRA (REVENUE) 2018 TAX RETURN" },
	{ type: "none", text: "CRA CHILD AND FAMILY BENEFITS", value: "CRA CHILD AND FAMILY BENEFITS" },
	{ type: "none", text: "CRA REVENUE TAX INSTALMENT", value: "CRA REVENUE TAX INSTALMENT" }
];

