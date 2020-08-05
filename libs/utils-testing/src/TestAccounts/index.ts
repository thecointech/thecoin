
import wallet1 from "./wallet1.json";
import wallet2 from "./wallet2.json";

const Account1 = {
  name: "TestAccNoT",
  wallet: wallet1,
  encrypted: JSON.stringify(wallet1),
  password: "TestAccNoT"
}

const Account2 = {
  name: "Thisismy",
  wallet: wallet2,
  encrypted: JSON.stringify(wallet2),
  password: "Thisismy"
}

export { Account1, Account2 };
