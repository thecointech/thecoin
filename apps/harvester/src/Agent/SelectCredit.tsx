import { Button } from "semantic-ui-react"
import { SelectBank } from "./SelectBank"
import { BankConnectReducer } from "./state/reducer"
import { InitialState } from "./state/initialState"

export const SelectCredit = ({ banks }: InitialState) => {
  const api = BankConnectReducer.useApi();

  const handleSetSimilar = () => {
    if (!banks.chequing) {
      alert("Chequing not configured");
      return;
    }
    api.setBank("credit", {
      name: banks.chequing.name,
      url: banks.chequing.url,
      icon: banks.chequing.icon,
    })
  }
  return (
    <div>
      <Button disabled={!banks.chequing} onClick={handleSetSimilar}>Same as Chequing</Button>
      <SelectBank type="credit" selected={banks.credit} />
    </div>
  )
}
