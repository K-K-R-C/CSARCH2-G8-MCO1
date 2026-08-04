export interface DivisionStep {
  label: string;
  description: string;
  details?: string;
}

export interface DivisionResult {
  inputA: number;
  inputB: number;
  signA: number;
  signB: number;
  exponentA: number;
  exponentB: number;
  significandA: string;
  significandB: string;
  binaryA: string;
  binaryB: string;
  resultSign: number;
  resultExponent: number;
  resultSignificand: string;
  resultBinary: string;
  resultHex: string;
  resultDecimal: number;
  specialCase: string | null;
  steps: DivisionStep[];
}

const BIAS = 127;
const SIGNIFICAND_BITS = 23;
const EXPONENT_BITS = 8;

function binaryToHex(binary: string): string {
  const padded = binary.padStart(32, "0");
  let hex = "";
  for (let i = 0; i < padded.length; i += 4) {
    hex += parseInt(padded.slice(i, i + 4), 2).toString(16).toUpperCase();
  }
  return hex;
}

export function groupBits(bits: string): string {
  return bits.match(/.{1,4}/g)?.join(" ") ?? bits;
}

function decomposeFloat(value: number): {
  sign: number;
  exponent: number;
  significand: string;
  binary: string;
} {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, false);
  const bits = view.getUint32(0, false);

  const sign = (bits >>> 31) & 1;
  const exponent = (bits >>> 23) & 0xFF;
  const significandNum = bits & 0x7FFFFF;
  const significand = significandNum.toString(2).padStart(23, "0");
  const binary = sign.toString() + exponent.toString(2).padStart(8, "0") + significand;

  return { sign, exponent, significand, binary };
}

function decodeIEEEBinary(binary: string): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, parseInt(binary, 2), false);
  return view.getFloat32(0, false);
}

function checkDivisionSpecialCase(a: number, b: number): string | null {
  const aNaN = Number.isNaN(a);
  const bNaN = Number.isNaN(b);
  const aInf = !isFinite(a) && !aNaN;
  const bInf = !isFinite(b) && !bNaN;
  const aZero = a === 0 || Object.is(a, -0);
  const bZero = b === 0 || Object.is(b, -0);

  if (aNaN || bNaN) return "NaN (NaN input)";
  if (aInf && bInf) return "NaN (∞ / ∞)";
  if (aZero && bZero) return "NaN (0 / 0)";

  if (aInf && !bInf) return a > 0 === b >= 0 ? "+Infinity" : "-Infinity";

  if (!aInf && bInf) {
    const resultNeg = (a < 0 || Object.is(a, -0)) !== (b < 0 || Object.is(b, -0));
    return resultNeg ? "-0" : "+0";
  }

  if (!aZero && bZero) {
    const resultNeg = (a < 0 || Object.is(a, -0)) !== (b < 0 || Object.is(b, -0));
    return resultNeg ? "-Infinity (÷ by 0)" : "+Infinity (÷ by 0)";
  }

  if (aZero && !bZero) {
    const resultNeg = Object.is(a, -0) !== (b < 0 || Object.is(b, -0));
    return resultNeg ? "-0" : "+0";
  }

  return null;
}

function buildSpecialResult(a: number, b: number, specialCase: string, steps: DivisionStep[]): DivisionResult {
  const decompA = decomposeFloat(a);
  const decompB = decomposeFloat(b);

  let resultSign = 0;
  let resultExponent = 0;
  let resultSignificand = "0".repeat(23);
  let resultDecimal: number;

  if (specialCase.includes("NaN")) {
    resultExponent = 255;
    resultSignificand = "1" + "0".repeat(22);
    resultDecimal = NaN;
  } else if (specialCase.includes("Infinity")) {
    resultSign = specialCase.includes("-") ? 1 : 0;
    resultExponent = 255;
    resultSignificand = "0".repeat(23);
    resultDecimal = resultSign === 1 ? -Infinity : Infinity;
  } else {
    resultSign = specialCase.includes("-") ? 1 : 0;
    resultExponent = 0;
    resultSignificand = "0".repeat(23);
    resultDecimal = resultSign === 1 ? -0 : 0;
  }

  const resultBinary = resultSign.toString() + resultExponent.toString(2).padStart(8, "0") + resultSignificand;
  const resultHex = binaryToHex(resultBinary);

  steps.push({
    label: "Special Case Detected",
    description: `This division is a special case: ${specialCase}`,
    details: `Result: ${resultBinary} (hex: ${resultHex})`,
  });

  return {
    inputA: a, inputB: b,
    signA: decompA.sign, signB: decompB.sign,
    exponentA: decompA.exponent, exponentB: decompB.exponent,
    significandA: decompA.significand, significandB: decompB.significand,
    binaryA: decompA.binary, binaryB: decompB.binary,
    resultSign, resultExponent, resultSignificand, resultBinary, resultHex, resultDecimal,
    specialCase, steps,
  };
}

export function divideIEEE754(a: number, b: number): DivisionResult {
  const steps: DivisionStep[] = [];

  steps.push({ label: "Inputs", description: `Dividing A = ${a} by B = ${b}` });

  const specialCase = checkDivisionSpecialCase(a, b);
  if (specialCase !== null) {
    return buildSpecialResult(a, b, specialCase, steps);
  }

  const decompA = decomposeFloat(a);
  const decompB = decomposeFloat(b);

  steps.push({
    label: "Decompose A",
    description: `A = ${a} → IEEE 754 single-precision`,
    details: `Sign: ${decompA.sign}\nExponent (biased): ${decompA.exponent} (${decompA.exponent.toString(2).padStart(8, "0")})\nSignificand: ${decompA.significand}\nFull: ${decompA.binary}`,
  });

  steps.push({
    label: "Decompose B",
    description: `B = ${b} → IEEE 754 single-precision`,
    details: `Sign: ${decompB.sign}\nExponent (biased): ${decompB.exponent} (${decompB.exponent.toString(2).padStart(8, "0")})\nSignificand: ${decompB.significand}\nFull: ${decompB.binary}`,
  });

  const resultSign = decompA.sign ^ decompB.sign;
  steps.push({
    label: "Determine Result Sign",
    description: `Sign = signA XOR signB = ${decompA.sign} XOR ${decompB.sign} = ${resultSign}`,
    details: resultSign === 0 ? "Result is positive (+)" : "Result is negative (−)",
  });

  const unbiasedA = decompA.exponent - BIAS;
  const unbiasedB = decompB.exponent - BIAS;
  const unbiasedResult = unbiasedA - unbiasedB;
  let resultExponent = unbiasedResult + BIAS;

  steps.push({
    label: "Compute Result Exponent",
    description: `Exponent = (expA − bias) − (expB − bias) + bias`,
    details: `expA (unbiased) = ${decompA.exponent} − ${BIAS} = ${unbiasedA}\nexpB (unbiased) = ${decompB.exponent} − ${BIAS} = ${unbiasedB}\nResult (unbiased) = ${unbiasedA} − ${unbiasedB} = ${unbiasedResult}\nResult (biased) = ${unbiasedResult} + ${BIAS} = ${resultExponent}`,
  });

  const fullSigA = (1 << SIGNIFICAND_BITS) | parseInt(decompA.significand, 2);
  const fullSigB = (1 << SIGNIFICAND_BITS) | parseInt(decompB.significand, 2);

  steps.push({
    label: "Normalize Significands",
    description: `Prepend the hidden bit (1.) to each significand`,
    details: `A: 1.${decompA.significand} = ${fullSigA} (decimal)\nB: 1.${decompB.significand} = ${fullSigB} (decimal)`,
  });

  const EXTRA_BITS = 3;
  const TOTAL_QUOTIENT_BITS = SIGNIFICAND_BITS + 1 + EXTRA_BITS;

  const dividendBig = BigInt(fullSigA) << BigInt(TOTAL_QUOTIENT_BITS);
  const divisorBig = BigInt(fullSigB);
  const quotientBig = dividendBig / divisorBig;
  const remainderBig = dividendBig % divisorBig;

  let quotient = Number(quotientBig);
  const hasRemainder = remainderBig !== 0n;

  steps.push({
    label: "Significand Division",
    description: `Divide significand A by significand B using fixed-point arithmetic`,
    details: `Dividend: ${fullSigA} << ${TOTAL_QUOTIENT_BITS} = ${dividendBig.toString()}\nDivisor: ${fullSigB}\nQuotient: ${quotientBig.toString()} (binary: ${quotientBig.toString(2)})\nRemainder: ${remainderBig.toString()}${hasRemainder ? " (non-zero → sticky bit will be set)" : ""}`,
  });

  let quotientBits = quotient.toString(2);
  const targetLength = TOTAL_QUOTIENT_BITS;
  const actualLength = quotientBits.length;
  const shiftNeeded = actualLength - targetLength;

  if (shiftNeeded > 0) {
    resultExponent += shiftNeeded;
    const shiftedOutBits = quotientBits.slice(quotientBits.length - shiftNeeded);
    const extraSticky = shiftedOutBits.includes("1") || hasRemainder;
    quotient = quotient >> shiftNeeded;
    if (extraSticky) quotient = quotient | 1;
    quotientBits = quotient.toString(2);
  } else if (shiftNeeded < 0) {
    const leftShift = -shiftNeeded;
    resultExponent -= leftShift;
    quotient = quotient << leftShift;
    quotientBits = quotient.toString(2);
  }

  steps.push({
    label: "Normalize Quotient",
    description: `Adjust quotient so the leading 1 is at bit position ${targetLength - 1}`,
    details: `Quotient length: ${actualLength} bits, target: ${targetLength} bits\nShift needed: ${shiftNeeded} (${shiftNeeded > 0 ? "right" : shiftNeeded < 0 ? "left" : "none"})\nAdjusted exponent (biased): ${resultExponent}\nNormalized quotient: ${quotientBits}`,
  });

  const guardBit = (quotient >> 2) & 1;
  const roundBit = (quotient >> 1) & 1;
  const stickyBit = ((quotient & 1) | (hasRemainder ? 1 : 0));
  let significand24 = quotient >> EXTRA_BITS;

  steps.push({
    label: "Extract GRS Bits",
    description: `Guard, Round, Sticky bits determine rounding`,
    details: `Guard (G): ${guardBit}\nRound (R): ${roundBit}\nSticky (S): ${stickyBit}\nSignificand (24 bits, before rounding): ${significand24.toString(2).padStart(24, "0")}`,
  });

  let roundUp = false;
  if (guardBit === 1) {
    if (roundBit === 1 || stickyBit === 1) {
      roundUp = true;
    } else {
      roundUp = (significand24 & 1) === 1;
    }
  }

  if (roundUp) {
    significand24 += 1;
    if (significand24 >= (1 << 24)) {
      significand24 = significand24 >> 1;
      resultExponent += 1;
    }
  }

  steps.push({
    label: "Rounding (Round-to-Nearest-Even)",
    description: roundUp
      ? `Rounding UP: G=${guardBit}, R=${roundBit}, S=${stickyBit}${guardBit === 1 && roundBit === 0 && stickyBit === 0 ? " (exactly halfway, LSB was 1 → round up to even)" : " (more than halfway)"}`
      : `No rounding needed: G=${guardBit}, R=${roundBit}, S=${stickyBit}${guardBit === 1 ? " (exactly halfway, LSB was 0 → already even)" : " (less than halfway)"}`,
    details: `Significand after rounding: ${significand24.toString(2).padStart(24, "0")}\nExponent after rounding: ${resultExponent}`,
  });

  let resultSignificand: string;

  if (resultExponent >= 255) {
    resultExponent = 255;
    resultSignificand = "0".repeat(23);
    steps.push({ label: "Overflow Detected", description: `Exponent ≥ 255 → result overflows to ${resultSign === 0 ? "+∞" : "−∞"}` });
  } else if (resultExponent <= 0) {
    resultExponent = 0;
    resultSignificand = "0".repeat(23);
    steps.push({ label: "Underflow Detected", description: `Exponent ≤ 0 → result underflows to ${resultSign === 0 ? "+0" : "−0"}` });
  } else {
    resultSignificand = (significand24 & ((1 << SIGNIFICAND_BITS) - 1)).toString(2).padStart(SIGNIFICAND_BITS, "0");
    steps.push({ label: "No Overflow/Underflow", description: `Exponent ${resultExponent} is in valid range [1, 254]`, details: `Significand (23 bits): ${resultSignificand}` });
  }

  const resultBinary = resultSign.toString() + resultExponent.toString(2).padStart(EXPONENT_BITS, "0") + resultSignificand;
  const resultHex = binaryToHex(resultBinary);
  const resultDecimal = decodeIEEEBinary(resultBinary);

  steps.push({
    label: "Assemble Result",
    description: `Combine sign + exponent + significand → 32-bit IEEE 754`,
    details: `Sign: ${resultSign}\nExponent: ${resultExponent.toString(2).padStart(8, "0")} (${resultExponent})\nSignificand: ${resultSignificand}\nBinary: ${groupBits(resultBinary)}\nHex: ${resultHex}\nDecimal: ${resultDecimal}`,
  });

  const nativeResult = a / b;
  const nativeBuffer = new ArrayBuffer(4);
  const nativeView = new DataView(nativeBuffer);
  nativeView.setFloat32(0, nativeResult, false);
  const nativeHex = nativeView.getUint32(0, false).toString(16).toUpperCase().padStart(8, "0");

  steps.push({
    label: "Verification",
    description: `Cross-check with JavaScript's native float32 division`,
    details: `JS native: ${a} / ${b} = ${nativeResult}\nNative float32 hex: ${nativeHex}\nOur result hex: ${resultHex}\nMatch: ${nativeHex === resultHex ? "✅ Yes" : "⚠️ No (may differ due to double→float rounding)"}`,
  });

  return {
    inputA: a, inputB: b,
    signA: decompA.sign, signB: decompB.sign,
    exponentA: decompA.exponent, exponentB: decompB.exponent,
    significandA: decompA.significand, significandB: decompB.significand,
    binaryA: decompA.binary, binaryB: decompB.binary,
    resultSign, resultExponent, resultSignificand, resultBinary, resultHex, resultDecimal,
    specialCase: null, steps,
  };
}
