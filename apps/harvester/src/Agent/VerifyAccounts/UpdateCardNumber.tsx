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
  return (
    <div className={styles.cardNumberEdit}>
      <div className={styles.cardNumberInput}>
        <UxInput
          defaultValue={originalNumber}
          forceValidate={forceValidate}
          intlLabel={translations.accountNumer}
          onValue={v => onChange(v ?? '')}
          onValidate={value => validate(payee, value)}
        />
      </div>
    </div>
  );
};
