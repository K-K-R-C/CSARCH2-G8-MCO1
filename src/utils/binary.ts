/**
 * Utility functions for low-level binary manipulation and decimal/binary conversion.
 * Member 5 Responsibility.
 */

/**
 * Converts a decimal number to its binary string representation.
 * Supports integer and fractional components.
 * @param decimal The input decimal number.
 * @param maxFractionBits Maximum number of fractional bits to compute (default 32).
 */
export function decimalToBinary(decimal: number, maxFractionBits: number = 32): string {
  if (Number.isNaN(decimal)) return "NaN";
  if (decimal === Infinity) return "Infinity";
  if (decimal === -Infinity) return "-Infinity";
  if (decimal === 0) return Object.is(decimal, -0) ? "-0" : "0";

  const isNegative = decimal < 0 || Object.is(decimal, -0);
  const absVal = Math.abs(decimal);
  const intPart = Math.floor(absVal);
  let fracPart = absVal - intPart;

  const intBinary = intPart.toString(2);
  let fracBinary = "";

  if (fracPart > 0) {
    let count = 0;
    while (fracPart > 0 && count < maxFractionBits) {
      fracPart *= 2;
      if (fracPart >= 1) {
        fracBinary += "1";
        fracPart -= 1;
      } else {
        fracBinary += "0";
      }
      count++;
    }
  }

  const result = fracBinary ? `${intBinary}.${fracBinary}` : intBinary;
  return isNegative ? `-${result}` : result;
}

/**
 * Converts a binary string (e.g. "101.101" or "-110.1") to a decimal number.
 */
export function binaryToDecimal(binary: string): number {
  if (!binary || typeof binary !== "string") return 0;

  const cleanBinary = binary.trim().replace(/\s+/g, "");
  if (cleanBinary === "NaN") return NaN;
  if (cleanBinary === "Infinity" || cleanBinary === "+Infinity") return Infinity;
  if (cleanBinary === "-Infinity") return -Infinity;

  let isNegative = false;
  let str = cleanBinary;
  if (str.startsWith("-")) {
    isNegative = true;
    str = str.slice(1);
  } else if (str.startsWith("+")) {
    str = str.slice(1);
  }

  const parts = str.split(".");
  const intStr = parts[0] || "0";
  const fracStr = parts[1] || "";

  let decimalVal = 0;

  // Integer part
  for (let i = 0; i < intStr.length; i++) {
    const bit = intStr[intStr.length - 1 - i];
    if (bit === "1") {
      decimalVal += Math.pow(2, i);
    } else if (bit !== "0") {
      // Invalid character encountered
      return NaN;
    }
  }

  // Fractional part
  for (let i = 0; i < fracStr.length; i++) {
    const bit = fracStr[i];
    if (bit === "1") {
      decimalVal += Math.pow(2, -(i + 1));
    } else if (bit !== "0") {
      return NaN;
    }
  }

  return isNegative ? -decimalVal : decimalVal;
}

/**
 * Normalizes a binary string (e.g., "110.101" -> mantissa "1.10101", exponent 2).
 */
export function normalizeBinary(binary: string): {
  mantissa: string;
  exponent: number;
  isNegative: boolean;
} {
  let str = binary.trim();
  const isNegative = str.startsWith("-");
  if (isNegative) str = str.slice(1);

  if (str === "0" || str === "0.0" || /^0+(\.0+)?$/.test(str)) {
    return { mantissa: "0", exponent: 0, isNegative };
  }

  const parts = str.split(".");
  let intPart = parts[0] || "";
  let fracPart = parts[1] || "";

  // Case 1: Integer part has non-zero bits (e.g. 110.101)
  const firstOneInt = intPart.indexOf("1");
  if (firstOneInt !== -1) {
    const exponent = intPart.length - 1 - firstOneInt;
    const combinedBits = intPart.slice(firstOneInt) + fracPart;
    const leading = combinedBits[0];
    const rest = removeTrailingZeros(combinedBits.slice(1));
    const mantissa = rest ? `${leading}.${rest}` : leading;
    return { mantissa, exponent, isNegative };
  }

  // Case 2: Integer part is 0, first '1' is in fractional part (e.g. 0.00101)
  const firstOneFrac = fracPart.indexOf("1");
  if (firstOneFrac !== -1) {
    const exponent = -(firstOneFrac + 1);
    const combinedBits = fracPart.slice(firstOneFrac);
    const leading = combinedBits[0];
    const rest = removeTrailingZeros(combinedBits.slice(1));
    const mantissa = rest ? `${leading}.${rest}` : leading;
    return { mantissa, exponent, isNegative };
  }

  return { mantissa: "0", exponent: 0, isNegative };
}

/**
 * Pads a bit string to target length.
 */
export function padBits(
  bits: string,
  targetLength: number,
  side: "left" | "right" = "left",
  fillChar: string = "0"
): string {
  if (bits.length >= targetLength) return bits;
  const fill = fillChar.repeat(targetLength - bits.length);
  return side === "left" ? fill + bits : bits + fill;
}

/**
 * Removes unnecessary leading zeros from a binary string.
 */
export function removeLeadingZeros(bits: string): string {
  if (!bits) return "0";
  const cleaned = bits.replace(/^0+(?=\d)/, "");
  return cleaned === "" ? "0" : cleaned;
}

/**
 * Removes unnecessary trailing zeros from fractional part.
 */
export function removeTrailingZeros(bits: string): string {
  if (!bits) return "";
  return bits.replace(/0+$/, "");
}

/**
 * Formats a binary string into grouped chunks (default 4 bits per group).
 */
export function groupBits(bits: string, groupSize: number = 4): string {
  if (!bits) return "";
  const cleaned = bits.replace(/\s+/g, "");
  const regex = new RegExp(`.{1,${groupSize}}`, "g");
  return cleaned.match(regex)?.join(" ") ?? cleaned;
}
