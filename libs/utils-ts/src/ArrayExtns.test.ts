import { first, isDefined, isFilled, isPresent, last } from "./ArrayExtns";

it ('correctly filters arrays', () => {

    // TODO: Is it possible to include 'void' in an array?
    const array = [1, 0, true, false, undefined, null];
    expect(array.filter(isPresent)).toEqual([1, true]);
    expect(array.filter(isDefined)).toEqual([1, 0, true, false, null]);
    expect(array.filter(isFilled)).toEqual([1, 0, true, false, undefined]);

    expect(first(array)).toBe(1);
    expect(last(array)).toBe(null);
})