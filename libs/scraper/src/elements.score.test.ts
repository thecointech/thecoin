import { getSiblingScore, getRoleScore } from "./elements.score";
import { patchOnnxForJest } from "../internal/jestPatch";

beforeAll(async () => {
  patchOnnxForJest();
})
// To review - This isn't the best evaluation,
// We probably need to improve the semantic
// analysis to get more context for a given element
it('scores siblings', async () => {

  // Should be pretty close to 1
  const baseline = await getSiblingScore(
    { siblingText: ["Account Number", "Account Balance"] } as any,
    { siblingText: ["Account #", "Current Balance"] } as any
  )
  expect(baseline).toBeCloseTo(0.7, 0.05)

  // Should be less then baseline
  const modOriginal = await getSiblingScore(
    { siblingText: ["Account Number", "Account Balance", "More Info Here"] } as any,
    { siblingText: ["Account #", "Current Balance"] } as any
  )
  expect(modOriginal).toBeLessThan(baseline)
  // Should be less then 1
  const modCurrent = await getSiblingScore(
    { siblingText: ["Account Number", "Account Balance"] } as any,
    { siblingText: ["Account #", "Current Balance", "More Info Here"] } as any
  )
  expect(modCurrent).toBeLessThan(baseline)
})

describe('scores roles appropriately', () => {
  it('scores correctly in replay mode', () => {
    // Test case 1: Exact role match in replay mode
    const exactMatch = getRoleScore(
      { role: 'button' } as any,
      { role: 'button' } as any
    );
    expect(exactMatch).toBe(1);

    // Test case 2: Role mismatch in replay mode
    const mismatch = getRoleScore(
      { role: 'button' } as any,
      { role: 'link' } as any
    );
    expect(mismatch).toBe(-1);

    // Test case 3: No roles in replay mode
    const noRoles = getRoleScore(
      { role: undefined } as any,
      { role: undefined } as any
    );
    expect(noRoles).toBe(0);

    // Test case 4: Original has role, potential doesn't in replay mode
    const originalHasRole = getRoleScore(
      { role: undefined } as any,
      { role: 'button' } as any
    );
    expect(originalHasRole).toBe(-1);

    // Test case 5: Potential has role, original doesn't in replay mode
    const potentialHasRole = getRoleScore(
      { role: 'button' } as any,
      { role: undefined } as any
    );
    expect(potentialHasRole).toBe(-1);
  })

  it('scores correctly in estimated mode', () => {
    // Test case 6: Exact role match in estimated mode
    const estimatedMatch = getRoleScore(
      { role: 'button' } as any,
      { role: 'button', estimated: true } as any
    );
    expect(estimatedMatch).toBe(1);

    // Test case 7: Role mismatch in estimated mode
    const estimatedMismatch = getRoleScore(
      { role: 'button' } as any,
      { role: 'link', estimated: true } as any
    );
    expect(estimatedMismatch).toBe(-1);

    // Test case 8: No roles in estimated mode
    const estimatedNoRoles = getRoleScore(
      { role: undefined } as any,
      { role: undefined, estimated: true } as any
    );
    expect(estimatedNoRoles).toBe(0);

    // Test case 9: Original has role, potential doesn't in estimated mode
    const estimatedOriginalOnly = getRoleScore(
      { role: undefined } as any,
      { role: 'button', estimated: true } as any
    );
    expect(estimatedOriginalOnly).toBe(0);

    // Test case 10: Potential has role, original doesn't in estimated mode
    const estimatedPotentialOnly = getRoleScore(
      { role: 'button' } as any,
      { role: undefined, estimated: true } as any
    );
    expect(estimatedPotentialOnly).toBe(0);

    // Test case 11: Both have different roles in estimated mode
    const estimatedBothDifferent = getRoleScore(
      { role: 'textbox' } as any,
      { role: 'combobox', estimated: true } as any
    );
    expect(estimatedBothDifferent).toBe(-1);

    // Test case 12: Edge case with null roles
    const nullRoles = getRoleScore(
      { role: null } as any,
      { role: null } as any
    );
    expect(nullRoles).toBe(0);

    // Test case 13: Edge case with empty string roles
    const emptyStringRoles = getRoleScore(
      { role: '' } as any,
      { role: '' } as any
    );
    expect(emptyStringRoles).toBe(0);
  })
});
