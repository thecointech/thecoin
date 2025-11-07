import { getSiblingScore, getRoleScore, getPositionAndSizeScore, getPositionScore } from "./elements.score";
import { patchOnnxForJest } from "../internal/jestPatch";
import type { Coords } from "@thecointech/scraper-types";

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

describe('position scoring', () => {
  const mockBounds = { width: 1920, height: 1080 };

  // Helper function to create coordinates with defaults
  const createCoords = (overrides: Partial<Coords> = {}) => {
    const r = {
      estimated: true,
      coords: {
        left: 100,
        top: 200,
        width: 50,
        height: 30,
        centerY: 215,
        ...overrides
      }
    }
    r.coords.centerY = r.coords.top + r.coords.height / 2;
    return r as any;
  }

  it('scores perfect position match', () => {
    const potential = createCoords();
    const original = createCoords();

    const score = getPositionAndSizeScore(potential, original, mockBounds);
    expect(score).toBe(1.0);
  });

  it('scores nearby elements positively', () => {
    const potential = createCoords({ left: 110, top: 210 });
    const original = createCoords();

    const score = getPositionAndSizeScore(potential, original, mockBounds);
    expect(score).toBeCloseTo(0.5, 1); // Close elements should score well
  });

  it('gives a -0.5 score for opposite side of page', () => {
    const potential = createCoords({ left: mockBounds.width - 50 });
    const original = createCoords({ left: 0, top: 230 });

    const score = getPositionScore(potential.coords, original.coords, mockBounds);
    // Should be capped at -0.5 total (combined X and Y axis caps)
    expect(score).toBeCloseTo(-0.5, 1);
  });

  it('gives close to 0 for elements that are touching', () => {
    const potential = createCoords(); // Far right, far down
    const original = createCoords({ left: 150, top: 130 }); // Top left

    const score = getPositionScore(potential.coords, original.coords, mockBounds);
    // Will give slight negative bias at touching elements
    expect(score).toBeCloseTo(-0.05);
  });

  it('handles estimated mode differently than replay mode', () => {
    const potential = createCoords({ left: 1000, top: 1000, width: 25, height: 300 });
    const originalReplay = createCoords();
    const originalEstimated = createCoords();
    originalReplay.estimated = false;


    const replayScore = getPositionAndSizeScore(potential, originalReplay, mockBounds);
    const estimatedScore = getPositionAndSizeScore(potential, originalEstimated, mockBounds);

    // Estimated mode should allow negative scores, replay mode should not
    expect(replayScore).toBeGreaterThanOrEqual(0);
    expect(estimatedScore).toBeLessThan(0);
  });

  it('returns 0 when coordinates are missing', () => {
    const potential = createCoords();
    const original = createCoords();
    original.coords = null;

    const score = getPositionAndSizeScore(potential, original, mockBounds);
    expect(score).toBe(0);
  });

  it ('is sensible when size is close to bounds', () => {
    // When comparing against a really large
    const potential = createCoords({"top":20,"left":20,"height":990,"width":990});
    const original = createCoords({"top":5,"left":5,"height":10,"width":10});

    const score = getPositionAndSizeScore(potential, original, {"width":1000,"height":1000});
    expect(score).toBeLessThan(-1);
  })

  it ('should still match if larger than bounds, but still close together', () => {
    // When comparing against a really large
    const potential = createCoords({"top":10,"left":10,"height":1200,"width":1200});

    const score = getPositionAndSizeScore(potential, potential, {"width":1000,"height":1000});
    expect(score).toBeCloseTo(1);
  })

  it('does not score too highly', () => {
    const potential = createCoords({"top":913.390625,"left":0,"centerY":1555.90625,"height":1285.03125,"width":1265});
    const original = createCoords({"top":82,"left":1066,"height":20,"width":56,"centerY":92});

    const score = getPositionAndSizeScore(potential, original, {"width":1265,"height":1180});
    expect(score).toBeLessThan(0);
  });
});
