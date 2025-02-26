import { useState } from "react"
import { BankCard, CustomBankCard } from "./BankCard/BankCard"
import { BankData, banks } from "./BankCard/data"

type Props = {
  type: 'chequing' | 'credit'
  onSelectBank: (bank: BankData) => void
}

export const BankSelect = ({ type, onSelectBank }: Props) => {

  const [selectedBank, setSelectedBank] = useState<BankData | undefined>(undefined)

  const handleSetBank = (bank: BankData) => {
    setSelectedBank(bank)
    onSelectBank(bank)
  }

  return (
    <>
      <p>Select your {type} bank provider:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {
          banks.map((bank, i) => (
            <BankCard key={i} {...bank} isSelected={bank.name === selectedBank?.name} onClick={handleSetBank} />
          ))
        }
        <CustomBankCard isSelected={selectedBank?.name === "Custom"} onClick={handleSetBank} />
      </div>
      {/* <Input
        visible={selectedBank === undefined}
        disabled={selectedBank?.url !== undefined}
        fluid
        value={selectedBank?.url ?? ""}
        // onChange={(e) => setUrl(e.target.value)}
        placeholder="URL to process"
        style={{ marginBottom: '1rem' }}
      /> */}
    </>
  )
}
