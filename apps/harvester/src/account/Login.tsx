import { Login as LoginUI } from "@thecointech/shared/containers/Login";
import { Account, AccountState } from '@thecointech/shared/containers/Account';

export const Login = (props: AccountState) => {

  // Start the account store (redux etc)
  Account(props.address).useStore();
  return (
    <div>
      <LoginUI account={props} />
    </div>
  );
}
