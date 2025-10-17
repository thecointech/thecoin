import type { ProcessAccount } from "@thecointech/scraper-agent/types";
import styles from "./AccountCard.module.less";

interface AccountCardProps {
  account: ProcessAccount;
  isSelected?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
}

export const AccountCard = ({ account, isSelected, isSelectable, onClick }: AccountCardProps) => {
  const cardClass = [
    styles.accountCard,
    isSelected && styles.selected,
    isSelectable && styles.selectable
  ].filter(Boolean).join(' ');

  const typeClass = account.account_type === 'Chequing' ? styles.chequing : styles.credit;

  return (
    <div className={cardClass} onClick={onClick}>
      <div className={styles.accountHeader}>
        <span className={`${styles.accountType} ${typeClass}`}>
          {account.account_type === 'Chequing' ? '🏦' : '💳'} {account.account_type}
        </span>
        {isSelected && (
          <span className={styles.selectedBadge}>
            ✓ Selected
          </span>
        )}
      </div>

      <div className={styles.accountDetails}>
        <div className={styles.detailRow}>
          <label>Account Name</label>
          <div className={styles.value}>{account.account_name}</div>
        </div>

        <div className={styles.detailRow}>
          <label>Account Number</label>
          <div className={styles.value}>
            {formatAccountNumber(account.account_number)}
            {isMasked(account.account_number) && ' (Masked)'}
          </div>
        </div>

        <div className={styles.detailRow}>
          <label>Balance</label>
          <div className={styles.balance}>
            {isNaN(parseFloat(account.balance))
              ? account.balance
              : `$${parseFloat(account.balance).toFixed(2)}`}
          </div>
        </div>
      </div>
    </div>
  );
};
// Helper functions
function formatAccountNumber(number: string): string {
  // Add spaces every 4 digits for readability
  return number.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function isMasked(accountNumber: string): boolean {
  return accountNumber.includes('*') || accountNumber.includes('X');
}
