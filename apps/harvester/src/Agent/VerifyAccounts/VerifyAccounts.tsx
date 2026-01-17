import { useCallback, useMemo, useState } from "react";
import styles from "./VerifyAccounts.module.less";
import { BankConnectReducer } from "../state/reducer";
import { NoAccounts } from "./NoAccounts";
import { CreditCardCorrection } from "./UpdateCardNumber";
import { AccountCard } from "./AccountCard";
import { Message } from "semantic-ui-react";
import { SupportedBanks } from "../BankCard/data";
import { findPayee, LegalPayeeName } from "@thecointech/site-app/src/containers/Accounts/BillPayments/payees";
import { ActionButton } from "@/ContentSection/Action";
import { NextButton } from "@/ContentSection/Next";
import { ProcessAccount } from "@thecointech/scraper-agent/types";

export const VerifyAccounts = () => {
  const api = BankConnectReducer.useApi();
  const { banks, stored } = BankConnectReducer.useData();
  const [forceValidate, setForceValidate] = useState(false);
  const [ storedNow, setStoredNow ] = useState<string>();

  const chequingAccounts = banks.chequing?.accounts?.filter(a => a.account_type === 'Chequing') || [];
  const creditAccounts = banks.credit?.accounts?.filter(a => a.account_type === 'Credit') || [];

  const chequingAccount = chequingAccounts[0];
  const [selectedCreditIndex, setSelectedCreditIndex] = useState(0);
  const creditAccount = creditAccounts[selectedCreditIndex];

  // We need the raw number as the user types it, as
  // for some accounts we can't know the card type from
  // the masked data or account name.
  const [rawEditedNumber, setRawEditedNumber] = useState<string>("");
  const [correctedCardNumber, setCorrectedCardNumber] = useState<string>("");

  const hasNoAccounts = !chequingAccount || !creditAccount;
  if (hasNoAccounts) {
    return <NoAccounts />;
  }

  const payeeName = banks.credit?.name;
  if (!payeeName) {
    return <div>No credit bank selected (should never happen)</div>;
  }

  const handleCreditAccountSelect = (index: number) => {
    setSelectedCreditIndex(index);
    setCorrectedCardNumber("");
    setRawEditedNumber("");
  };

  const payee = getPayee(payeeName, creditAccount, rawEditedNumber);
  // if (!payee) {
  //   // TODO: Make a proper component for this.
  //   return <div>Missing Payee for {payeeName}</div>;
  // }
  const rawAccNumber = creditAccount.account_number.replace(/\D/g, '');
  const cardNumError = useMemo(
    () => payee?.validate(rawAccNumber) || true,
    [payee, rawAccNumber]
  );

  const onValidate = useCallback((value: string) => {
    // Always capture the raw edited number.  For ambiguous card types,
    // we simply trust whatever the user types.
    setRawEditedNumber(value);
    if (!payee) {
      return {
        id: "not-used-yet",
        defaultMessage: "Could not determine card type from account details.  Please enter the complete number.",
      };
    }
    const cardNumError = payee.validate(value);
    return cardNumError;
  }, [payee, setRawEditedNumber]);

  const saveAccounts = async () => {
    if (cardNumError) {
      setForceValidate(true);
      if (!correctedCardNumber) {
        return;
      }
    }

    if (!payee) {
      // Should already be displaying a warning
      return;
    }

    const accountNumber = correctedCardNumber || rawAccNumber;
    const r = await window.scraper.setCreditDetails({
      payee: payee.value,
      accountNumber,
    })
    if (r.error) {
      alert(r.error);
      return;
    }
    api.setStored();
    setStoredNow(accountNumber);
  }

  const isValid = useCallback(() => {
    setForceValidate(true);
    return !!stored;
  }, [stored]);
  const cardNumValid = !cardNumError || !!correctedCardNumber;

  const isStoredNow = storedNow === (correctedCardNumber || rawAccNumber);

  return (
    <div className={styles.verifyAccountsContainer}>
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

            {(cardNumError || !payee) && (
              <CreditCardCorrection
                forceValidate={forceValidate}
                originalNumber={creditAccount.account_number.replace(/\s/g, '')}
                onValidate={onValidate}
                onChange={setCorrectedCardNumber}
              />
            )}
          </div>
        )}
      </div>
      <VerifyAccountsMessage forceValidate={forceValidate} payee={payee?.value} isStored={stored} storedNow={isStoredNow} cardNumValid={cardNumValid} />
      <ActionButton onClick={saveAccounts} disabled={forceValidate && !cardNumValid}>Store Accounts</ActionButton>

      <NextButton onValid={isValid} to="/config" />
    </div>
  );
};

const VerifyAccountsMessage = ({ forceValidate, isStored, payee, cardNumValid, storedNow }: { forceValidate: boolean, isStored?: boolean, payee?: string, cardNumValid?: boolean, storedNow?: boolean }) => {
  if (!payee) {
    return (
      <Message warning>
        Could not validate payee from account name or card number.  Please check the credit card number.
      </Message>
    )
  }
  if (forceValidate) {
    if (!cardNumValid) {
      return (
        <Message warning>
          <strong>⚠️ Masked Number Detected:</strong> The credit card number is partially hidden.
          Please enter the complete number for bill payments.
        </Message>
      )
    }
    else if (!isStored) {
      return (
        <Message>
          Once account details are verified, please store them before continuing
        </Message>
      )
    }
  }

  if (storedNow) {
    return (
      <Message success>
        Account details stored successfully
      </Message>
    )
  }
  else if (isStored) {
    return (
      <Message>
        Account details stored previously
      </Message>
    )
  }
  return null;
}



// Helper function to format account number for dropdown display
function formatAccountNumberShort(number: string): string {
  // Show first 4 and last 4 digits for identification
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length <= 8) return number;
  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.substring(cleaned.length - 4);
  return `${first4}...${last4}`;
}

function getPayee(creditBank: string, account: ProcessAccount, rawEditedNumber?: string) {

  const cardType = getCardType(account, rawEditedNumber);
  const name = toPayeeName(creditBank, cardType);
  if (!name) {
    return undefined;
  }
  return findPayee(name);
}

type CardType = "visa" | "mastercard";
function getCardType(account: ProcessAccount, rawEditedNumber?: string): CardType|undefined {

  // If we have a user-supplied card number, defer to that.
  if (rawEditedNumber) {
    return getTypeFromNumber(rawEditedNumber);
  }

  // If the name contains the card type, it's definitely that card type
  const name = account.account_name.toLowerCase();
  if (name.includes("mastercard")) {
    return "mastercard";
  }
  if (name.includes("visa")) {
    return "visa";
  }

  // We assume that the first digit is the first digit of the card number
  // This could be wrong if the bank only posts the last 4 digits (and
  // no masking prior - which seems unlikely), or if VQA guesses wrong (
  // which is probably more likely).
  //
  // However, if we guess wrong, then the user will not be able to enter
  // the card number, so at least it won't fail silently.
  return getTypeFromNumber(account.account_number);
}

function getTypeFromNumber(account: string) {
  switch(account[0]) {
    case '4': return "visa";
    case '2': return "mastercard";
    case '5': return "mastercard";
  }
  return undefined;
}

function toPayeeName(creditBank: string, cardType?: CardType): LegalPayeeName|undefined {
  // NOTE: Many of these banks support multiple card types.
  // We should use the account name to find the name most similar
  switch(creditBank as SupportedBanks) {
    case 'RBC':
      switch (cardType) {
        case "mastercard": return "RBC ROYAL BANK MASTERCARD";
        case "visa": return 'VISA ROYAL BANK';
      }
      break;
    case 'TD':
      switch (cardType) {
        case "mastercard": return 'TD MASTERCARD';
        case "visa": return "VISA - TORONTO DOMINION";
      }
      break;
    case 'CIBC':
      switch (cardType) {
        case "mastercard": return "CIBC MASTERCARD";
        case "visa": return 'VISA - CIBC';
      }
      break;
    case 'Scotiabank':
      switch (cardType) {
        case "mastercard": return "MASTERCARD - SCOTIABANK";
        case "visa": return 'VISA-SCOTIABANK AND SCOTIALINE VISA';
      }
      break;
    case 'Tangerine':
      if (cardType == "mastercard") {
        return 'TANGERINE MASTERCARD';
      }
      break;
    case 'BMO':
      switch (cardType) {
        case "mastercard": return "BMO MASTERCARD";
        case "visa": return "BMO VISA CREDIT CARD";
      }
      break;
    case 'National Bank':
      return "NATIONAL BANK MASTERCARD";
  }
  return undefined;
}

