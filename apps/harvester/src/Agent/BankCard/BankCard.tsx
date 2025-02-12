import type { BankData } from "./data";

type Props = BankData & {
  isSelected: boolean
  onClick: (bank: BankData) => void
};
export const BankCard: React.FC<Props> = ({ name, url, icon, isSelected, onClick }) => {
  const style = isSelected ? { border: '1px solid #FC0' } : { border: '1px solid grey' }
  return (
    <div style={{ ...style, cursor: 'pointer' }} onClick={() => onClick({ name, url, icon })}>
      <img style={{ width: '200px', height: '200px' }} src={icon} alt={name} />
    </div>
  );
}
