// subtraction.ts
//
// Performs A - B using the same sign/exponent/coefficient representation
// produced by decimalConverter.ts .
// floating-point add/subtract pipeline:
//
//   1. Normalize operands        (reuse convertDecimalToIEEE)
//   2. Align exponents           (shift the smaller-magnitude significand right)
//   3. Add/subtract significands (A - B == A + (-B), so we flip B's sign
//                                 and reduce to the "same-sign add / diff-sign
//                                 subtract" rule)
//   4. Normalize the result      (handle carry-out on add, cancellation on subtract)
//   5. Round                     (round-to-nearest, ties-to-even, using
//                                 guard/round/sticky bits)
//   6. Emit final decimal/binary/hex
//
// NOTE ON FORMAT: this engine works against whatever bit layout
// decimalConverter.ts / ieee754.ts produce (currently: 1 sign bit, 8 exponent
// bits biased by 127, 23 coefficient bits — i.e. binary32 layout). The MCO
// spec calls Machine 4 the "Decimal 32-bit Floating-Point Machine" (IEEE 754
// **decimal** single-precision, which really uses a combination field +
// densely-packed-decimal coefficient, not this layout). That's a converter
// engine decision, not a subtraction engine one — flagging it so Member 1 /
// the team can confirm which encoding we're actually shipping. Everything
// below is written against the *shape* of IEEEResult, so it keeps working
// either way as long as sign/exponentBits/coefficient stay in that shape.

import { convertDecimalToIEEE } from "./decimalConverter";
import type { IEEEResult } from "./decimalConverter";

const COEFF_WIDTH = 23; // explicit coefficient bits (hidden bit is implicit)
const EXP_WIDTH = 8;
const EXP_BIAS = 127;

export interface SubtractionStep {
  title: string;
  detail: string;
}

export interface SubtractionResult {
  operandA: IEEEResult;
  operandB: IEEEResult;
  steps: SubtractionStep[];
  specialCase: string | null; // NaN / Infinity / -Infinity / +0 / -0 / Overflow / Underflow, or null
  sign: number;
  exponentBits: string; // biased, 8 bits
  coefficient: string; // 23 bits
  binary: string; // "s eeeeeeee ccc...c" spaced
  hex: string;
  decimal: number;
}

// ---------- shared bit helpers (local copies — binary.ts/hex.ts)
// were still empty stubs at the time this was written; swap these calls out
// for the shared utilities once those land, to avoid duplicate logic) ----------

function groupBits(bits: string, size = 4): string {
  return bits.match(new RegExp(`.{1,${size}}`, "g"))?.join(" ") ?? bits;
}

function binaryToHex(binary: string): string {
  const padded = binary.padStart(Math.ceil(binary.length / 4) * 4, "0");
  let hex = "";
  for (let i = 0; i < padded.length; i += 4) {
    hex += parseInt(padded.slice(i, i + 4), 2).toString(16).toUpperCase();
  }
  return hex;
}

function bitsToStr(bits: number[]): string {
  return bits.join("");
}

// full significand with the implicit leading 1 restored: [hidden, ...23 coeff bits]
function significandBits(r: IEEEResult): number[] {
  return [1, ...r.coefficient.split("").map(Number)];
}

function isZeroResult(r: IEEEResult): boolean {
  return r.specialCase === "+0" || r.specialCase === "-0";
}

function isInfResult(r: IEEEResult): boolean {
  return r.specialCase === "Infinity" || r.specialCase === "-Infinity";
}

function isNaNResult(r: IEEEResult): boolean {
  return r.specialCase === "NaN";
}

function buildFrom(sign: number, exponentBits: string, coefficient: string): {
  binary: string;
  hex: string;
} {
  const binary = `${sign}${exponentBits}${coefficient}`;
  return { binary, hex: binaryToHex(binary) };
}

function decodeNormalized(sign: number, biasedExp: number, coefficient: string): number {
  const trueExp = biasedExp - EXP_BIAS;
  let frac = 0;
  for (let i = 0; i < coefficient.length; i++) {
    if (coefficient[i] === "1") frac += Math.pow(2, -(i + 1));
  }
  return (sign === 1 ? -1 : 1) * (1 + frac) * Math.pow(2, trueExp);
}

// ---------- main entry point ----------

export function subtractIEEE(aInput: number, bInput: number): SubtractionResult {
  const A = convertDecimalToIEEE(aInput);
  const B = convertDecimalToIEEE(bInput);
  const steps: SubtractionStep[] = [];

  steps.push({
    title: "Normalize operands",
    detail:
      `A = ${aInput} -> sign ${A.sign}, exponent ${groupBits(A.exponentBits, 8)} (biased), ` +
      `coefficient ${groupBits(A.coefficient)}\n` +
      `B = ${bInput} -> sign ${B.sign}, exponent ${groupBits(B.exponentBits, 8)} (biased), ` +
      `coefficient ${groupBits(B.coefficient)}`,
  });

  // ---- special-case propagation (A - B == A + (-B)) ----
  // Effective sign of B is flipped because we're computing a subtraction.
  const effSignB = B.sign === 1 ? 0 : 1;

  if (isNaNResult(A) || isNaNResult(B)) {
    steps.push({ title: "Special case", detail: "One or both operands are NaN -> result is NaN." });
    return finalize(A, B, steps, "NaN", 0, "11111111", "1" + "0".repeat(22));
  }

  if (isInfResult(A) && isInfResult(B)) {
    if (A.sign === effSignB) {
      const sign = A.sign;
      steps.push({
        title: "Special case",
        detail: `Both operands are infinite with the same effective sign -> result is ${sign === 1 ? "-Infinity" : "Infinity"}.`,
      });
      return finalize(A, B, steps, sign === 1 ? "-Infinity" : "Infinity", sign, "11111111", "0".repeat(23));
    }
    steps.push({ title: "Special case", detail: "Infinity - Infinity (opposing effective signs) -> NaN." });
    return finalize(A, B, steps, "NaN", 0, "11111111", "1" + "0".repeat(22));
  }

  if (isInfResult(A)) {
    steps.push({ title: "Special case", detail: `A is infinite -> result is ${A.specialCase}.` });
    return finalize(A, B, steps, A.specialCase, A.sign, "11111111", "0".repeat(23));
  }

  if (isInfResult(B)) {
    const sign = effSignB;
    steps.push({
      title: "Special case",
      detail: `B is infinite -> result takes B's flipped sign -> ${sign === 1 ? "-Infinity" : "Infinity"}.`,
    });
    return finalize(A, B, steps, sign === 1 ? "-Infinity" : "Infinity", sign, "11111111", "0".repeat(23));
  }

  if (isZeroResult(A) && isZeroResult(B)) {
    // IEEE rule for round-to-nearest: X - X (or +0 - -0 etc.) is +0 unless
    // both effective signs agree, in which case the sign carries through.
    const sign = A.sign === effSignB ? A.sign : 0;
    steps.push({
      title: "Special case",
      detail: `Both operands are zero -> result is ${sign === 1 ? "-0" : "+0"}.`,
    });
    return finalize(A, B, steps, sign === 1 ? "-0" : "+0", sign, "0".repeat(8), "0".repeat(23));
  }

  if (isZeroResult(A)) {
    // 0 - B = -B
    steps.push({ title: "Special case", detail: "A is zero -> result is -B." });
    return finalize(A, B, steps, B.specialCase, effSignB, B.exponentBits, B.coefficient);
  }

  if (isZeroResult(B)) {
    // A - 0 = A
    steps.push({ title: "Special case", detail: "B is zero -> result is A, unchanged." });
    return finalize(A, B, steps, A.specialCase, A.sign, A.exponentBits, A.coefficient);
  }

  // ---- general case: align exponents ----
  const expA = parseInt(A.exponentBits, 2);
  const expB = parseInt(B.exponentBits, 2);
  const sigA = significandBits(A); // 24 bits: [hidden, 23 coeff bits]
  const sigB = significandBits(B);

  let bigExp: number, bigSig: number[], bigSign: number;
  let smallSig: number[], smallSign: number;
  let expDiff = expA - expB;

  if (expDiff >= 0) {
    bigExp = expA; bigSig = sigA.slice(); bigSign = A.sign;
    smallSig = sigB.slice(); smallSign = effSignB;
  } else {
    bigExp = expB; bigSig = sigB.slice(); bigSign = effSignB;
    smallSig = sigA.slice(); smallSign = A.sign;
    expDiff = -expDiff;
  }

  // Shift the smaller significand right by expDiff bits, collecting the bits
  // that fall off the end into guard/round/sticky for later rounding.
  const shiftedOut: number[] = [];
  const shifted = smallSig.slice();
  for (let i = 0; i < expDiff; i++) {
    const dropped = shifted.pop();
    shiftedOut.unshift(dropped === undefined ? 0 : dropped);
    shifted.unshift(0);
  }
  const guard = shiftedOut[0] ?? 0;
  const round = shiftedOut[1] ?? 0;
  const sticky = shiftedOut.slice(2).some((b) => b === 1);

  steps.push({
    title: "Align exponents",
    detail:
      expDiff === 0
        ? "Exponents already match — no shifting needed."
        : `Exponent difference = ${expDiff}. Shifting the smaller-magnitude significand right by ${expDiff} bit(s). ` +
          `Guard=${guard}, Round=${round}, Sticky=${sticky ? 1 : 0}.`,
  });

  const bigExt = [...bigSig, 0, 0]; // pad with guard/round positions so widths match
  const smallExt = [...shifted, guard, round];

  let resultBits: number[];
  let resultSign: number;
  let stickyOut = sticky;

  if (bigSign === smallSign) {
    // same effective sign -> magnitude addition
    resultBits = new Array(bigExt.length).fill(0);
    let carry = 0;
    for (let i = bigExt.length - 1; i >= 0; i--) {
      const sum = bigExt[i] + smallExt[i] + carry;
      resultBits[i] = sum % 2;
      carry = sum >= 2 ? 1 : 0;
    }
    resultSign = bigSign;

    steps.push({
      title: "Add significands",
      detail: `Operands share the same effective sign after the sign flip -> magnitudes are added. ` +
        `Sum = ${bitsToStr(resultBits)}${carry ? " (carry out of the MSB)" : ""}`,
    });

    let resultExp = bigExp;
    if (carry === 1) {
      // overflow past the hidden bit: shift right by 1, bump exponent
      stickyOut = stickyOut || resultBits[resultBits.length - 1] === 1;
      resultBits = [1, ...resultBits.slice(0, -1)];
      resultExp += 1;
      steps.push({
        title: "Normalize result",
        detail: `Addition overflowed the hidden bit -> shift right by 1, exponent becomes ${resultExp} (biased).`,
      });
    } else {
      steps.push({ title: "Normalize result", detail: "No overflow — result is already normalized." });
    }

    return roundAndFinalize(A, B, steps, resultSign, resultExp, resultBits, stickyOut);
  } else {
    // different effective sign -> magnitude subtraction (compare first)
    const cmp = compareBits(bigExt, smallExt);
    let minuend = bigExt, subtrahend = smallExt, sign = bigSign;
    if (cmp < 0) {
      minuend = smallExt; subtrahend = bigExt; sign = smallSign;
    }

    resultBits = new Array(minuend.length).fill(0);
    let borrow = 0;
    for (let i = minuend.length - 1; i >= 0; i--) {
      let diff = minuend[i] - subtrahend[i] - borrow;
      if (diff < 0) { diff += 2; borrow = 1; } else borrow = 0;
      resultBits[i] = diff;
    }
    resultSign = sign;

    steps.push({
      title: "Subtract significands",
      detail: `Operands have opposing effective signs -> the smaller magnitude is subtracted from the larger. ` +
        `Difference = ${bitsToStr(resultBits)}`,
    });

    if (resultBits.every((b) => b === 0)) {
      steps.push({ title: "Normalize result", detail: "Operands were equal in magnitude -> exact zero result." });
      return finalize(A, B, steps, "+0", 0, "0".repeat(8), "0".repeat(23));
    }

    let resultExp = bigExp;
    let shiftCount = 0;
    while (resultBits[0] === 0 && shiftCount < resultBits.length - 1) {
      resultBits.shift();
      resultBits.push(0);
      shiftCount++;
    }
    resultExp -= shiftCount;

    if (shiftCount > 0) {
      steps.push({
        title: "Normalize result",
        detail: `Cancellation occurred (leading zero bits) -> shift left by ${shiftCount}, exponent becomes ${resultExp} (biased).`,
      });
    } else {
      steps.push({ title: "Normalize result", detail: "No cancellation — result is already normalized." });
    }

    return roundAndFinalize(A, B, steps, resultSign, resultExp, resultBits, false);
  }
}

function compareBits(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

// bits layout coming in: [hidden, 23 coeff bits, guard, round]; `sticky` passed separately
function roundAndFinalize(
  A: IEEEResult,
  B: IEEEResult,
  steps: SubtractionStep[],
  sign: number,
  biasedExp: number,
  bits: number[],
  sticky: boolean,
): SubtractionResult {
  const coeffBits = bits.slice(1, 1 + COEFF_WIDTH);
  const guard = bits[1 + COEFF_WIDTH] ?? 0;
  const round = bits[1 + COEFF_WIDTH + 1] ?? 0;

  let roundUp = false;
  if (guard === 1) {
    if (round === 1 || sticky) roundUp = true;
    else roundUp = coeffBits[coeffBits.length - 1] === 1; // exact tie -> round to even
  }

  let finalCoeff = coeffBits.slice();
  let finalExp = biasedExp;

  if (roundUp) {
    let i = finalCoeff.length - 1;
    let carry = 1;
    while (i >= 0 && carry) {
      const sum = finalCoeff[i] + carry;
      finalCoeff[i] = sum % 2;
      carry = sum >= 2 ? 1 : 0;
      i--;
    }
    if (carry) {
      // rounding carried all the way into the hidden bit: 1.111..1 + ulp = 10.000..0
      finalCoeff = new Array(COEFF_WIDTH).fill(0);
      finalExp += 1;
    }
    steps.push({
      title: "Round (round-to-nearest, ties-to-even)",
      detail: `Guard=${guard}, Round=${round}, Sticky=${sticky ? 1 : 0} -> rounded up. Final coefficient = ${bitsToStr(finalCoeff)}${carry ? `, exponent bumped to ${finalExp} (biased)` : ""}.`,
    });
  } else {
    steps.push({
      title: "Round (round-to-nearest, ties-to-even)",
      detail: `Guard=${guard}, Round=${round}, Sticky=${sticky ? 1 : 0} -> no rounding needed. Final coefficient = ${bitsToStr(finalCoeff)}.`,
    });
  }

  // exponent range check (this format's exponent field is EXP_WIDTH bits wide)
  const maxExp = (1 << EXP_WIDTH) - 1; // all-ones = reserved for Inf/NaN
  if (finalExp >= maxExp) {
    steps.push({ title: "Special case", detail: "Result exponent overflowed the exponent field -> rounds to Infinity." });
    return finalize(A, B, steps, sign === 1 ? "-Infinity" : "Infinity", sign, "1".repeat(EXP_WIDTH), "0".repeat(COEFF_WIDTH));
  }
  if (finalExp <= 0) {
    // true subnormal handling is out of scope for this engine (see header note) —
    // flush to zero rather than emit a bit pattern we can't decode correctly.
    steps.push({
      title: "Special case",
      detail: "Result exponent underflowed below the smallest normalized exponent -> flushed to zero (subnormal results are a known limitation).",
    });
    return finalize(A, B, steps, sign === 1 ? "-0" : "+0", sign, "0".repeat(EXP_WIDTH), "0".repeat(COEFF_WIDTH));
  }

  const exponentBits = finalExp.toString(2).padStart(EXP_WIDTH, "0");
  return finalize(A, B, steps, null, sign, exponentBits, bitsToStr(finalCoeff));
}

function finalize(
  A: IEEEResult,
  B: IEEEResult,
  steps: SubtractionStep[],
  specialCase: string | null,
  sign: number,
  exponentBits: string,
  coefficient: string,
): SubtractionResult {
  const { binary, hex } = buildFrom(sign, exponentBits, coefficient);
  let decimal: number;
  if (specialCase === "NaN") decimal = NaN;
  else if (specialCase === "Infinity") decimal = Infinity;
  else if (specialCase === "-Infinity") decimal = -Infinity;
  else if (specialCase === "+0") decimal = 0;
  else if (specialCase === "-0") decimal = -0;
  else decimal = decodeNormalized(sign, parseInt(exponentBits, 2), coefficient);

  steps.push({
    title: "Final result",
    detail: `Decimal: ${Object.is(decimal, -0) ? "-0" : decimal}\n` +
      `Binary: ${sign} ${groupBits(exponentBits, 8)} ${groupBits(coefficient)}\n` +
      `Hex: ${hex}`,
  });

  return {
    operandA: A,
    operandB: B,
    steps,
    specialCase,
    sign,
    exponentBits,
    coefficient,
    binary,
    hex,
    decimal,
  };
}
