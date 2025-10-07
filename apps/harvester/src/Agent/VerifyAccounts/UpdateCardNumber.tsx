import { UxInput } from "@thecointech/shared";
import styles from "./UpdateCardNumber.module.less";
import { validate } from "@thecointech/site-app/src/containers/Accounts/BillPayments/payees";

interface CreditCardCorrectionProps {
  forceValidate: boolean;
  originalNumber: string;
  payee: string;
  onChange: (value: string) => void;
}

const translations = {
  accountNumer: {
    id: 'not-used',
    defaultMessage: 'Credit Card Number',
  },
}

export const CreditCardCorrection = ({ forceValidate, payee, originalNumber, onChange }: CreditCardCorrectionProps) => {
  // const isValid = correctedNumber.length >= 13 && correctedNumber.length <= 19 && !error;
  // const hasInput = correctedNumber.length > 0;

  return (
    <div className={styles.cardNumberEdit}>
      <div className={styles.maskedWarning}>
        <span className={styles.icon}>⚠️</span>
        <div>
          <strong>Masked Number Detected:</strong> The credit card number is partially hidden.
          Please enter the complete number for bill payments.
        </div>
      </div>

      <div className={styles.cardNumberInput}>
        <UxInput
          defaultValue={originalNumber}
          forceValidate={forceValidate}
          intlLabel={translations.accountNumer}
          // transformDisplayValue={{
          //   toDisplay: withSpaces,
          //   toValue: noSpaces,
          // }}
          onValue={v => onChange(v ?? '')}
          onValidate={value => validate(payee, value)}
        />
        {/* <input
          type="text"
          placeholder="Enter complete credit card number"
          value={correctedNumber}
          onChange={(e) => onChange(e.target.value)}
          className={hasInput ? (isValid ? styles.valid : styles.invalid) : ''}
          maxLength={19}
        /> */}
        {/* {hasInput && (
          <span className={`${styles.validateIcon} ${isValid ? styles.valid : styles.invalid}`}>
            {isValid ? '✓' : '✗'}
          </span>
        )} */}
      </div>

      {/* {error && <div className={styles.errorText}>{error}</div>}
      {!error && hasInput && isValid && (
        <div className={styles.helpText}>✓ Valid card number entered</div>
      )}
      {!hasInput && (
        <div className={styles.helpText}>
          Original: {originalNumber}
        </div>
      )} */}
    </div>
  );
};

// Group the number with spaces
// const withSpaces = (value: string) => value.replace(/(.{4})/g, '$1 ');
// const noSpaces = (value: string) => value.replace(/\s/g, '');
