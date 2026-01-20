import { Button } from "semantic-ui-react"
import { SelectBank } from "./SelectBank"
import { BankConnectReducer } from "./state/reducer"
import { useNavigate } from "react-router"

export const SelectCredit = () => {
  const api = BankConnectReducer.useApi();
  const { banks } = BankConnectReducer.useData();
  const navigate = useNavigate();

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
    navigate("/agent/loginBoth");
  }
  return (
    <div>
      <Button disabled={!banks.chequing} onClick={handleSetSimilar}>Same as Chequing</Button>
      <SelectBank type="credit" selected={banks.credit} />
    </div>
  )
}
