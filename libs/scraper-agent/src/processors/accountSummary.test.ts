import { updateAccountNumber } from "./accountSummary"


it('extracts account number from summary page', async () => {
  const inferred = { account_number: "13467-80", account_type: "Credit" } as any
  const real = { text: "Account: 1234-567-890 $12354" } as any
  expect(updateAccountNumber(inferred, real)).toBe("1234-567-890")
})
