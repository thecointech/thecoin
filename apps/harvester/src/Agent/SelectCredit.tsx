import { Button } from "semantic-ui-react"
import { SelectBank } from "./SelectBank"
import { BankConnectReducer } from "./state/reducer"

export const SelectCredit = () => {
  const api = BankConnectReducer.useApi();
  const data = BankConnectReducer.useData();

  const handleSetSimilar = () => {
    api.setBank("credit", data.chequing!)
  }
  return (
    <div>
      <Button disabled={!data.chequing} onClick={handleSetSimilar}>Same as Chequing</Button>
      <SelectBank type="credit" />
    </div>
  )
}
