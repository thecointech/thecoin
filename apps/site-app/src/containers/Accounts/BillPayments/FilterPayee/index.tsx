import React from "react";
import styles from './styles.module.less';

import iconbanks from './images/icon_bank_big.svg';
import iconvisa from './images/icon_visa_big.svg';
import icontaxes from './images/icon_taxes_big.svg';
import iconother from './images/icon_other_big.svg';
import iconall from './images/icon_all_big.svg';
import { StyledChoice } from "../StyledChoice";
import { defineMessages } from "react-intl";

const translations = defineMessages({
    all : {
        defaultMessage: 'All categories',
        description: 'app.accounts.billPayments.filterPayee.all: Label for the filter payee for the form the make a payment page / bill payment tab'},
    banks : {
        defaultMessage: 'Banks',
        description: 'app.accounts.billPayments.filterPayee.banks: Label for the filter payee for the form the make a payment page / bill payment tab'},
    visa : {
        defaultMessage: 'Visa Card',
        description: 'app.accounts.billPayments.filterPayee.visa: Label for the filter payee for the form the make a payment page / bill payment tab'},
    taxes : {
        defaultMessage: 'Taxes',
        description: 'app.accounts.billPayments.filterPayee.taxes: Label for the filter payee for the form the make a payment page / bill payment tab'},
    other : {
        defaultMessage: 'Other',
        description: 'app.accounts.billPayments.filterPayee.other: Label for the filter payee for the form the make a payment page / bill payment tab'}
  });
  
export const FilterPayee = () => {
    return (
        <div className={styles.swipeZone}>
            <ul className={styles.hs}>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="all" name="payeeType" value="all" img={iconall} message={translations.all} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="banks" name="payeeType" value="banks" img={iconbanks} message={translations.banks} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="visa" name="payeeType" value="visa" img={iconvisa} message={translations.visa} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="taxes" name="payeeType" value="taxes" img={icontaxes} message={translations.taxes} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="other" name="payeeType" value="other" img={iconother} message={translations.other} />
                </li>
            </ul>
        </div>
    );
}