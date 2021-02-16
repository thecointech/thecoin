import React from "react";
import styles from './styles.module.less';

import iconbanks from './images/icon_bank_big.svg';
import iconvisa from './images/icon_visa_big.svg';
import icontaxes from './images/icon_taxes_big.svg';
import iconother from './images/icon_other_big.svg';
import iconall from './images/icon_all_big.svg';
import { StyledChoice } from "../StyledChoice";

const all = { id:"app.accounts.billPayments.filterPayee.all",
                defaultMessage:"All categories",
                description:"Label for the filter payee for the form the make a payment page / bill payment tab" }; 
const banks = { id:"app.accounts.billPayments.filterPayee.banks",
                defaultMessage:"Banks",
                description:"Label for the filter payee for the form the make a payment page / bill payment tab" };
const visa = { id:"app.accounts.billPayments.filterPayee.visa",
                defaultMessage:"Visa Card",
                description:"Label for the filter payee for the form the make a payment page / bill payment tab" };
const taxes = { id:"app.accounts.billPayments.filterPayee.taxes",
                defaultMessage:"Taxes",
                description:"Label for the filter payee for the form the make a payment page / bill payment tab" };
const other = { id:"app.accounts.billPayments.filterPayee.other",
                defaultMessage:"Other",
                description:"Label for the filter payee for the form the make a payment page / bill payment tab" };

export const FilterPayee = () => {
    return (
        <div className={styles.swipeZone}>
            <ul className={styles.hs}>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="all" name="payeeType" value="all" img={iconall} message={all} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="banks" name="payeeType" value="banks" img={iconbanks} message={banks} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="visa" name="payeeType" value="visa" img={iconvisa} message={visa} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="taxes" name="payeeType" value="taxes" img={icontaxes} message={taxes} />
                </li>
                <li className={ `${styles.item}` }>
                    <StyledChoice id="other" name="payeeType" value="other" img={iconother} message={other} />
                </li>
            </ul>
        </div>
    );
}