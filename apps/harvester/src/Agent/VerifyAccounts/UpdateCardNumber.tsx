import { UxInput, type ValidateCB } from "@thecointech/shared";
import styles from "./UpdateCardNumber.module.less";

interface CreditCardCorrectionProps {
  forceValidate: boolean;
  originalNumber: string;
  onChange: (value: string) => void;
  onValidate: ValidateCB<string>;
}

const translations = {
  accountNumer: {
    id: 'not-used',
    defaultMessage: 'Credit Card Number',
  },
}

export const CreditCardCorrection = ({ forceValidate, originalNumber, onChange, onValidate }: CreditCardCorrectionProps) => {
  return (
    <div className={styles.cardNumberEdit}>
      <div className={styles.cardNumberInput}>
        <UxInput
          defaultValue={originalNumber}
          forceValidate={forceValidate}
          intlLabel={translations.accountNumer}
          onValue={v => onChange(v ?? '')}
          onValidate={onValidate}
        />
      </div>
    </div>
  );
};
