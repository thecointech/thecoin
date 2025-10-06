import { useState } from "react";
import styles from "./VerifyAccounts.module.less";
import { InitialState } from "../state/initialState";
import { BankConnectReducer } from "../state/reducer";
import { AccountResult } from "../state/types";
import { NoAccounts } from "./NoAccounts";
import { CreditCardCorrection } from "./UpdateCardNumber";
import { AccountCard, isMasked } from "./AccountCard";

export const VerifyAccounts = ({ state }: { state: InitialState }) => {
  // const bankConnect = state;
  const api = BankConnectReducer.useApi();

  // const [creditNumber, setCreditNumber] = useState<string>("");

  // const chequingAccounts = state.chequing?.results?.filter(a => a.account_type === 'Chequing') || [];
  // const creditAccounts = state.credit?.results?.filter(a => a.account_type === 'Credit') || [];

  const chequingAccounts = [
    {
      account_name: "Chequing",
      account_number: "1234567890",
      account_type: "Chequing" as const,
      balance: "150.00",
    },
  ]
  const creditAccounts = [
    {
      account_name: "My Credit Card",
      account_number: "1234 56** **** **56",
      account_type: "Credit" as const,
      balance: "125.00",
    },
    {
      account_name: "My Other Credit Card",
      account_number: "1234 5678 9012 3456",
      account_type: "Credit" as const,
      balance: "125.00",
    },
  ]

  const chequingAccount = chequingAccounts[0];
  const [selectedCreditIndex, setSelectedCreditIndex] = useState(0);
  const creditAccount = creditAccounts[selectedCreditIndex];

  const [correctedCardNumber, setCorrectedCardNumber] = useState<string>("");
  const [cardNumberError, setCardNumberError] = useState<string>("");

  const hasNoAccounts = !chequingAccount && !creditAccount;

  if (hasNoAccounts) {
    return <NoAccounts />;
  }

  const handleCreditAccountSelect = (index: number) => {
    setSelectedCreditIndex(index);
    setCorrectedCardNumber("");
    setCardNumberError("");
  };

  const handleCardNumberChange = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    setCorrectedCardNumber(cleaned);

    // Validate
    if (cleaned.length === 0) {
      setCardNumberError("");
    } else if (cleaned.length < 13 || cleaned.length > 19) {
      setCardNumberError("Credit card numbers are typically 13-19 digits");
    } else if (!luhnCheck(cleaned)) {
      setCardNumberError("Invalid card number (failed Luhn check)");
    } else {
      setCardNumberError("");
      // Update the account in the reducer
      if (creditAccount && state.credit?.results) {
        const updatedResults = [...state.credit.results];
        updatedResults[selectedCreditIndex] = {
          ...creditAccount,
          account_number: cleaned
        };
        api.setCompleted('credit', true, updatedResults);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Verify Your Accounts</h2>
        <p>
          Please review the accounts found by the scraper and correct any masked credit card numbers.
        </p>
      </div>

      <div className={styles.accountsGrid}>
        {/* Chequing Account Section */}
        {chequingAccount && (
          <div className={styles.accountSection}>
            <h3 className={styles.sectionTitle}>Chequing Account</h3>
            <AccountCard account={chequingAccount} />
          </div>
        )}

        {/* Credit Account Section */}
        {creditAccounts.length > 0 && (
          <div className={styles.accountSection}>
            <h3 className={styles.sectionTitle}>Credit Account</h3>

            {creditAccounts.length > 1 && (
              <div className={styles.multipleAccountsNote}>
                <strong>Multiple credit accounts found.</strong> Click on an account to make it active.
              </div>
            )}

            {creditAccounts.map((account, index) => (
              <div key={index}>
                <AccountCard
                  account={account}
                  isSelected={index === selectedCreditIndex}
                  isSelectable={creditAccounts.length > 1}
                  onClick={() => handleCreditAccountSelect(index)}
                />

                {index === selectedCreditIndex && isMasked(account.account_number) && (
                  <CreditCardCorrection
                    originalNumber={account.account_number}
                    correctedNumber={correctedCardNumber}
                    error={cardNumberError}
                    onChange={handleCardNumberChange}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




// Luhn algorithm for credit card validation
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost digit
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
