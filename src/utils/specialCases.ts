/**
 * Utility functions for IEEE-754 special cases detection and propagation.
 * Member 5 Responsibility.
 */

export const FLOAT32_MAX = 3.4028234663852886e38;
export const FLOAT32_MIN_NORMAL = 1.1754943508222875e-38;
export const FLOAT32_MIN_SUBNORMAL = 1.401298464324817e-45;

/**
 * Checks if the value is NaN.
 */
export function isNaNValue(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isNaN(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    return trimmed === "nan" || trimmed === "snan" || trimmed === "qnan";
  }
  return false;
}

/**
 * Checks if the value is positive or negative Infinity.
 */
export function isInfinity(value: number): boolean {
  return value === Infinity || value === -Infinity;
}

/**
 * Checks if the value is positive Infinity.
 */
export function isPositiveInfinity(value: number): boolean {
  return value === Infinity;
}

/**
 * Checks if the value is negative Infinity.
 */
export function isNegativeInfinity(value: number): boolean {
  return value === -Infinity;
}

/**
 * Checks if the value is negative zero (-0).
 */
export function isNegativeZero(value: number): boolean {
  return Object.is(value, -0);
}

/**
 * Checks if the value is positive zero (+0).
 */
export function isPositiveZero(value: number): boolean {
  return Object.is(value, 0) || Object.is(value, +0);
}

/**
 * Checks if a value overflows IEEE-754 single-precision range.
 */
export function overflow(value: number): boolean {
  if (isInfinity(value)) return true;
  if (isNaNValue(value)) return false;
  return Math.abs(value) > FLOAT32_MAX;
}

/**
 * Checks if a non-zero value underflows IEEE-754 single-precision range.
 */
export function underflow(value: number): boolean {
  if (isNaNValue(value) || isInfinity(value) || value === 0) return false;
  return Math.abs(value) < FLOAT32_MIN_NORMAL;
}

/**
 * Helper to normalize string or number operand to a special case key or number
 */
function parseOperand(op: number | string): { isNum: boolean; val: number; strVal: string } {
  if (typeof op === "number") {
    return { isNum: true, val: op, strVal: String(op) };
  }
  const str = String(op).trim();
  if (str.toLowerCase() === "nan") {
    return { isNum: true, val: NaN, strVal: "NaN" };
  }
  if (str === "Infinity" || str === "+Infinity") {
    return { isNum: true, val: Infinity, strVal: "Infinity" };
  }
  if (str === "-Infinity") {
    return { isNum: true, val: -Infinity, strVal: "-Infinity" };
  }
  if (str === "-0") {
    return { isNum: true, val: -0, strVal: "-0" };
  }
  if (str === "0" || str === "+0") {
    return { isNum: true, val: 0, strVal: "+0" };
  }
  const parsed = parseFloat(str);
  return { isNum: !Number.isNaN(parsed), val: parsed, strVal: str };
}

/**
 * Propagates special cases through arithmetic operations (subtraction, division, addition, multiplication).
 * Returns the special case string ("NaN", "Infinity", "-Infinity", "+0", "-0") if applicable, or null if normal computation should proceed.
 */
export function propagateSpecialCase(
  op1: number | string,
  op2: number | string,
  operation: "subtraction" | "division" | "addition" | "multiplication" = "subtraction"
): string | null {
  const p1 = parseOperand(op1);
  const p2 = parseOperand(op2);

  // 1. Any NaN operand produces NaN
  if (isNaNValue(p1.val) || isNaNValue(p2.val)) {
    return "NaN";
  }

  const isInf1 = isInfinity(p1.val);
  const isInf2 = isInfinity(p2.val);
  const isZero1 = p1.val === 0;
  const isZero2 = p2.val === 0;

  if (operation === "subtraction") {
    // Inf - Inf -> NaN
    if (isInf1 && isInf2) {
      if ((p1.val > 0 && p2.val > 0) || (p1.val < 0 && p2.val < 0)) {
        return "NaN";
      }
      return p1.val > 0 ? "Infinity" : "-Infinity";
    }
    if (isInf1) {
      return p1.val > 0 ? "Infinity" : "-Infinity";
    }
    if (isInf2) {
      return p2.val > 0 ? "-Infinity" : "Infinity";
    }
    if (isZero1 && isZero2) {
      if (isNegativeZero(p1.val) && !isNegativeZero(p2.val)) {
        return "-0";
      }
      return "+0";
    }
  } else if (operation === "division") {
    // 0 / 0 -> NaN
    if (isZero1 && isZero2) {
      return "NaN";
    }
    // Inf / Inf -> NaN
    if (isInf1 && isInf2) {
      return "NaN";
    }
    // x / 0 -> ±Infinity
    if (isZero2) {
      const sign1 = isNegativeZero(p1.val) || p1.val < 0 ? -1 : 1;
      const sign2 = isNegativeZero(p2.val) || p2.val < 0 ? -1 : 1;
      return sign1 * sign2 < 0 ? "-Infinity" : "Infinity";
    }
    // Inf / x -> ±Infinity
    if (isInf1) {
      const sign1 = p1.val < 0 ? -1 : 1;
      const sign2 = isNegativeZero(p2.val) || p2.val < 0 ? -1 : 1;
      return sign1 * sign2 < 0 ? "-Infinity" : "Infinity";
    }
    // x / Inf -> ±0
    if (isInf2) {
      const sign1 = isNegativeZero(p1.val) || p1.val < 0 ? -1 : 1;
      const sign2 = p2.val < 0 ? -1 : 1;
      return sign1 * sign2 < 0 ? "-0" : "+0";
    }
    // 0 / x -> ±0
    if (isZero1) {
      const sign1 = isNegativeZero(p1.val) ? -1 : 1;
      const sign2 = isNegativeZero(p2.val) || p2.val < 0 ? -1 : 1;
      return sign1 * sign2 < 0 ? "-0" : "+0";
    }
  }

  return null;
}
