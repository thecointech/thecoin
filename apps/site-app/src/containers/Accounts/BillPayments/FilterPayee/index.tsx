import React from "react"
import styles from './styles.module.less';

import banks from './images/icon_bank_big.svg';
import visa from './images/icon_visa_big.svg';
import taxes from './images/icon_taxes_big.svg';
import other from './images/icon_other_big.svg';
import all from './images/icon_all_big.svg';

export const FilterPayee = () => {
    return (
        <div className={styles.app}>
        <ul className={styles.hs}>
        <li className={ `${styles.item} ${styles.selectableCards}` }>
            <input id="all" type="radio" name="payeeType" value="all" defaultChecked={true} />
            <label htmlFor="all">
                <img src={all} />
                <br />
                <span>All</span>
            </label>
        </li>
        <li className={ `${styles.item} ${styles.selectableCards}` }>
                <input id="banks" type="radio" name="payeeType" value="banks" />
            <label htmlFor="banks">
                <img src={banks} />
                <br />
                <span>Banks</span>
            </label>
        </li>
        <li className={ `${styles.item} ${styles.selectableCards}` }>
            <input id="visa" type="radio" name="payeeType" value="visa" />
            <label htmlFor="visa">
                <img src={visa} />
                <br />
                <span>Visa Card</span>
            </label>
        </li>
        <li className={ `${styles.item} ${styles.selectableCards}` }>
            <input id="taxes" type="radio" name="payeeType" value="taxes" />
            <label htmlFor="taxes">
                <img src={taxes} />
                <br />
                <span>Taxes</span>
            </label>
        </li>
        <li className={ `${styles.item} ${styles.selectableCards}` }>
            <input id="other" type="radio" name="payeeType" value="other" />
            <label htmlFor="other">
                <img src={other} />
                <br />
                <span>Other</span>
            </label>
        </li>
        </ul>
    </div>
    );
}