import { describe, it, expect } from "vitest";
import {
  isNaNValue,
  isInfinity,
  isPositiveInfinity,
  isNegativeInfinity,
  isNegativeZero,
  isPositiveZero,
  overflow,
  underflow,
  propagateSpecialCase,
} from "../specialCases";

describe("Member 5 Special Cases Utility Tests", () => {
  it("should detect NaN values", () => {
    expect(isNaNValue(NaN)).toBe(true);
    expect(isNaNValue("NaN")).toBe(true);
    expect(isNaNValue("nan")).toBe(true);
    expect(isNaNValue(123.45)).toBe(false);
    expect(isNaNValue(Infinity)).toBe(false);
  });

  it("should detect Infinities", () => {
    expect(isInfinity(Infinity)).toBe(true);
    expect(isInfinity(-Infinity)).toBe(true);
    expect(isInfinity(100)).toBe(false);

    expect(isPositiveInfinity(Infinity)).toBe(true);
    expect(isPositiveInfinity(-Infinity)).toBe(false);

    expect(isNegativeInfinity(-Infinity)).toBe(true);
    expect(isNegativeInfinity(Infinity)).toBe(false);
  });

  it("should distinguish positive and negative zero", () => {
    expect(isNegativeZero(-0)).toBe(true);
    expect(isNegativeZero(0)).toBe(false);

    expect(isPositiveZero(0)).toBe(true);
    expect(isPositiveZero(+0)).toBe(true);
    expect(isPositiveZero(-0)).toBe(false);
  });

  it("should detect overflow and underflow", () => {
    expect(overflow(1e39)).toBe(true);
    expect(overflow(3.4028236e38)).toBe(true);
    expect(overflow(123.45)).toBe(false);

    expect(underflow(1e-40)).toBe(true);
    expect(underflow(123.45)).toBe(false);
    expect(underflow(0)).toBe(false);
  });

  it("should propagate special cases through subtraction", () => {
    expect(propagateSpecialCase("NaN", 5, "subtraction")).toBe("NaN");
    expect(propagateSpecialCase(Infinity, Infinity, "subtraction")).toBe("NaN");
    expect(propagateSpecialCase(Infinity, -Infinity, "subtraction")).toBe("Infinity");
    expect(propagateSpecialCase(-Infinity, Infinity, "subtraction")).toBe("-Infinity");
    expect(propagateSpecialCase(-0, 0, "subtraction")).toBe("-0");
  });

  it("should propagate special cases through division", () => {
    expect(propagateSpecialCase(0, 0, "division")).toBe("NaN");
    expect(propagateSpecialCase(Infinity, Infinity, "division")).toBe("NaN");
    expect(propagateSpecialCase(5, 0, "division")).toBe("Infinity");
    expect(propagateSpecialCase(-5, 0, "division")).toBe("-Infinity");
    expect(propagateSpecialCase(Infinity, 5, "division")).toBe("Infinity");
    expect(propagateSpecialCase(5, Infinity, "division")).toBe("+0");
  });
});
