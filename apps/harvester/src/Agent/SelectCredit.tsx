import { Button } from "semantic-ui-react"
import { SelectBank } from "./SelectBank"
import { BankConnectReducer } from "./state/reducer"

export const SelectCredit = () => {
  const api = BankConnectReducer.useApi();
  const data = BankConnectReducer.useData();

  const handleSetSimilar = () => {
    if (!data.chequing) {
      alert("Chequing not configured");
      return;
    }
    api.setBank("credit", {
      name: data.chequing.name,
      url: data.chequing.url,
      icon: data.chequing.icon,
    })
  }
  return (
    <div>
      <Button disabled={!data.chequing} onClick={handleSetSimilar}>Same as Chequing</Button>
      <SelectBank type="credit" />
    </div>
  )
}
