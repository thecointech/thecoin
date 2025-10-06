import { BankCard, CustomBankCard } from "./BankCard/BankCard"
import { BankData, banks } from "./BankCard/data"
import { BankConnectReducer } from "./state/reducer"
import { BankType } from "./state/types"

type Props = {
  type: BankType
}

export const SelectBank = ({ type }: Props) => {

  const api = BankConnectReducer.useApi();
  const data = BankConnectReducer.useData();
  const handleSetBank = (bank: BankData) => {
    api.setBank(type, bank)
  }

  return (
    <>
      <p>Select your {type} bank provider:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {
          banks.map((bank, i) => (
            <BankCard key={i} {...bank} isSelected={bank.name === data[type]?.name} onClick={handleSetBank} />
          ))
        }
        <CustomBankCard isSelected={data[type]?.name === "Custom"} onClick={handleSetBank} />
      </div>
    </>
  )
}
