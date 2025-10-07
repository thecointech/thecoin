import { BankCard, CustomBankCard } from "./BankCard/BankCard"
import { BankData, banks } from "./BankCard/data"
import { BankConnectReducer } from "./state/reducer"
import { BankType } from "./state/types"
import type { BankReducerType } from "./state/initialState"

type Props = {
  type: BankType
  selected?: BankReducerType
}

export const SelectBank = ({ type, selected }: Props) => {

  const api = BankConnectReducer.useApi();
  const handleSetBank = (bank: BankData) => {
    api.setBank(type, bank)
  }

  return (
    <>
      <p>Select your {type} bank provider:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {
          banks.map((bank, i) => (
            <BankCard key={i} {...bank} isSelected={bank.name === selected?.name} onClick={handleSetBank} />
          ))
        }
        <CustomBankCard isSelected={selected?.name === "Custom"} onClick={handleSetBank} />
      </div>
    </>
  )
}
