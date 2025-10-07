import { useState } from "react";
import styles from "./VerifyAccounts.module.less";
import type { InitialState } from "../state/initialState";
import { BankConnectReducer } from "../state/reducer";
import { NoAccounts } from "./NoAccounts";
import { CreditCardCorrection } from "./UpdateCardNumber";
import { AccountCard, isMasked } from "./AccountCard";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { SupportedBanks } from "../BankCard/data";
import { findPayee, LegalPayeeName } from "@thecointech/site-app/src/containers/Accounts/BillPayments/payees";

export const VerifyAccounts = ({banks}: InitialState) => {
  // const bankConnect = state;
  const api = BankConnectReducer.useApi();
  const [forceValidate, setForceValidate] = useState(false);


  // const [creditNumber, setCreditNumber] = useState<string>("");
  // const [overrideCreditNumber, setOverrideCreditNumber] = useState<string>();

  const chequingAccounts = banks.chequing?.accounts?.filter(a => a.account_type === 'Chequing') || [];
  const creditAccounts = banks.credit?.accounts?.filter(a => a.account_type === 'Credit') || [];

  // const chequingAccounts = [
  //   {
  //     account_name: "Chequing",
  //     account_number: "1234567890",
  //     account_type: "Chequing" as const,
  //     balance: "150.00",
  //   },
  // ]
  // const creditAccounts = [
  //   {
  //     account_name: "My Credit Card",
  //     account_number: "1234 56** **** **56",
  //     account_type: "Credit" as const,
  //     balance: "125.00",
  //   },
  //   {
  //     account_name: "My Other Credit Card",
  //     account_number: "1234 5678 9012 3456",
  //     account_type: "Credit" as const,
  //     balance: "125.00",
  //   },
  // ]

  const chequingAccount = chequingAccounts[0];
  const [selectedCreditIndex, setSelectedCreditIndex] = useState(0);
  const creditAccount = creditAccounts[selectedCreditIndex];

  const [correctedCardNumber, setCorrectedCardNumber] = useState<string>("");
  const [cardNumberError, setCardNumberError] = useState<string>("");

  const hasNoAccounts = !chequingAccount && !creditAccount;

  if (hasNoAccounts) {
    return <NoAccounts />;
  }

  const payeeName = banks.credit?.name;
  if (!payeeName) {
    return <div>No credit bank selected (should never happen)</div>;
  }

  const payee = getPayee(payeeName);
  if (!payee) {
    // TODO: Make a proper component for this.
    return <div>Missing Payee for {payeeName}</div>;
  }

  const handleCreditAccountSelect = (index: number) => {
    setSelectedCreditIndex(index);
    setCorrectedCardNumber("");
    setCardNumberError("");
  };

  // const handleCardNumberChange = (value: string) => {
  //   // Remove any non-digit characters
  //   const cleaned = value.replace(/\D/g, '');
  //   setCorrectedCardNumber(cleaned);

  //   // Validate
  //   if (cleaned.length === 0) {
  //     setCardNumberError("");
  //   } else {
  //     const errorMessage = payee.validate(cleaned);
  //     if (errorMessage) {
  //       const message = errorMessage.defaultMessage;
  //       setCardNumberError(intl.formatMessage(message));
  //     } else {
  //       setCardNumberError("");
  //     }
  //   }
  // };

  const saveAccounts = async () => {
    setForceValidate(true);
    if (!correctedCardNumber) {
      return;
    }
    if (cardNumberError) {
      const confirm = window.confirm(`The card number you provided is invalid: \n${cardNumberError}\nAre you sure you want to continue?`);
      if (!confirm) return;
    }

    if (!correctedCardNumber) {
      const accountNumberDigits = creditAccount.account_number.replace(/\D/g, '');
      if (accountNumberDigits.length < 15) {
        setCardNumberError("Masked card number detected.  Please enter the full card number.")
        return;
      }
      else {
        const errorMessage = payee.validate(accountNumberDigits);
        if (errorMessage) {
          setCardNumberError(errorMessage.defaultMessage as string);
          return;
        }
      }
    }
    const accountNumber = correctedCardNumber || creditAccount.account_number;
    const r = await window.scraper.setCreditDetails({
      payee: payee.value,
      accountNumber,
    })
    if (r.error) {
      alert(r.error);
      return;
    }
    api.setStored();
  }

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
              <div className={styles.accountSelector}>
                <label htmlFor="credit-account-select">Select Account:</label>
                <select
                  id="credit-account-select"
                  value={selectedCreditIndex}
                  onChange={(e) => handleCreditAccountSelect(parseInt(e.target.value))}
                  className={styles.accountDropdown}
                >
                  {creditAccounts.map((account, index) => (
                    <option key={index} value={index}>
                      {account.account_name} - {formatAccountNumberShort(account.account_number)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <AccountCard account={creditAccount} />

            {isMasked(creditAccount.account_number) && (
              <CreditCardCorrection
                forceValidate={forceValidate}
                originalNumber={creditAccount.account_number.replace(/\s/g, '')}
                payee={payee.value}
                onChange={setCorrectedCardNumber}
              />
            )}
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <Button onClick={saveAccounts} disabled={correctedCardNumber.length === 0}>Store Accounts</Button>
        <Link to="/config">Configure how the harvester will run</Link>
      </div>
    </div>
  );
};




// Helper function to format account number for dropdown display
function formatAccountNumberShort(number: string): string {
  // Show first 4 and last 4 digits for identification
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length <= 8) return number;
  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.substring(cleaned.length - 4);
  return `${first4}...${last4}`;
}

function getPayee(creditBank: string) {
  const name = toPayeeName(creditBank);
  if (!name) {
    return undefined;
  }
  return findPayee(name);
}

function toPayeeName(creditBank: string): LegalPayeeName|undefined {
  switch(creditBank as SupportedBanks) {
    case 'RBC':
      return 'VISA ROYAL BANK';
    case 'TD':
      return 'VISA - TORONTO DOMINION';
    case 'CIBC':
      return 'VISA - CIBC';
    case 'Scotiabank':
      return 'VISA-SCOTIABANK AND SCOTIALINE VISA';
    case 'BMO':
    case 'National Bank':
    case 'Tangerine':
    default:
      // TODO: Add more banks
      return undefined;
  }
}

