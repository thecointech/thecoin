import { SelectBank } from "./SelectBank"
import type { InitialState } from "./state/initialState"

export const SelectChequing = ({ banks }: InitialState) => {
  return (
    <div>
      <SelectBank type="chequing" selected={banks.chequing} />
    </div>
  )
}
