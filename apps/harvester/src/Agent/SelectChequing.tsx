import { SelectBank } from "./SelectBank"
import { BankConnectReducer } from "./state/reducer"

export const SelectChequing = () => {
  const { banks } = BankConnectReducer.useData();
  return (
    <div>
      <SelectBank type="chequing" selected={banks.chequing} />
    </div>
  )
}
