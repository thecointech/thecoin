import { getTestData } from "../../internal/getTestData";
import { updateAccountNumber } from "./accountSummary"
import { IsManualRun, describe } from '@thecointech/jestutils';

describe('Account number live tests', () => {
  it('extracts account number from summary page', async () => {
    const inferred = { account_number: "13467-80", account_type: "Credit" } as any
    const real = { text: "Account: 1234-567-890 $12354" } as any
    expect(updateAccountNumber(inferred, real)).toBe("1234-567-890")
  })
}, IsManualRun)

describe('cached tests', () => {

  const tests = getTestData("AccountsSummary", "account")
  for (const test of tests) {
    it(`Finds the account number for ${test.target}`, () => {
      const listed = test.vqa("listAccounts");

      for (const inferred of listed.response.accounts) {
        const element = test.elm("account");

        const actual = updateAccountNumber(inferred, element.data)

        // This is sufficient for the tests we have now, but likely will not work
        // in more complicated situations.
        const siblings = element.data.siblingText.map(s => s.replaceAll(/[a-zA-Z]/g, "").trim())
        expect(siblings).toContain(actual);
      }
    })
  }
}, !!process.env.PRIVATE_TESTING_PAGES)
