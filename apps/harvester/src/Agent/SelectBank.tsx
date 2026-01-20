import { BankCard, CustomBankCard } from "./BankCard/BankCard"
import { BankData, banks } from "./BankCard/data"
import { BankConnectReducer } from "./state/reducer"
import { RendererBankType } from "./state/types"
import type { BankReducerType } from "./state/initialState"
import { Message } from "semantic-ui-react"
import { useState } from "react"
import { useSimplePathContext } from "@/SimplePath"

type Props = {
  type: RendererBankType
  selected?: BankReducerType
}

export const SelectBank = ({ type, selected }: Props) => {

  const [forceValid, setForceValid] = useState(false);
  const api = BankConnectReducer.useApi();
  const handleSetBank = (bank: BankData) => {
    api.setBank(type, bank)
  }

  const isValid = () => {
    setForceValid(true);
    return !!selected;
  }
  const context = useSimplePathContext();
  context.onValidate = isValid;

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
      <SelectBankMessage forceValid={forceValid} selected={!!selected} type={type} />
    </>
  )
}


export const SelectBankMessage = ({ forceValid, selected, type }: { forceValid: boolean, selected: boolean, type: RendererBankType }) => {
  if (forceValid && !selected) {
    return (
      <Message warning>
        <p>Select the bank with the {type} account to connect:</p>
      </Message>
    )
  }
  return null;
}
