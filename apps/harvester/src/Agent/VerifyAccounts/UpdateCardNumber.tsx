import styles from "./UpdateCardNumber.module.less";

interface CreditCardCorrectionProps {
  originalNumber: string;
  correctedNumber: string;
  error: string;
  onChange: (value: string) => void;
}

export const CreditCardCorrection = ({ originalNumber, correctedNumber, error, onChange }: CreditCardCorrectionProps) => {
  const isValid = correctedNumber.length >= 13 && correctedNumber.length <= 19 && !error;
  const hasInput = correctedNumber.length > 0;

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
        <input
          type="text"
          placeholder="Enter complete credit card number"
          value={correctedNumber}
          onChange={(e) => onChange(e.target.value)}
          className={hasInput ? (isValid ? styles.valid : styles.invalid) : ''}
          maxLength={19}
        />
        {hasInput && (
          <span className={`${styles.validateIcon} ${isValid ? styles.valid : styles.invalid}`}>
            {isValid ? '✓' : '✗'}
          </span>
        )}
      </div>

      {error && <div className={styles.errorText}>{error}</div>}
      {!error && hasInput && isValid && (
        <div className={styles.helpText}>✓ Valid card number entered</div>
      )}
      {!hasInput && (
        <div className={styles.helpText}>
          Original: {originalNumber}
        </div>
      )}
    </div>
  );
};
