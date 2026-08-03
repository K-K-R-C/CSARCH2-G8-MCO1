/**
 * Utility functions for low-level Hexadecimal manipulation and IEEE-754 single precision encoding/decoding.
 * Member 5 Responsibility.
 */

import { padBits } from "./binary";

/**
 * Converts a binary string to an uppercase hexadecimal string.
 * Automatically left-pads binary string to a multiple of 4 bits.
 */
export function binaryToHex(binary: string): string {
  const cleaned = binary.trim().replace(/\s+/g, "");
  if (!cleaned) return "";
  if (!/^[01]+$/.test(cleaned)) return "INVALID";

  const padLength = Math.ceil(cleaned.length / 4) * 4;
  const paddedBinary = padBits(cleaned, padLength, "left", "0");

  let hex = "";
  for (let i = 0; i < paddedBinary.length; i += 4) {
    const chunk = paddedBinary.slice(i, i + 4);
    hex += parseInt(chunk, 2).toString(16).toUpperCase();
  }
  return hex;
}

/**
 * Converts a hexadecimal string to a binary string.
 * Optionally pads output to targetBitLength.
 */
export function hexToBinary(hex: string, targetBitLength?: number): string {
  const cleaned = hex.trim().replace(/^0x/i, "").toUpperCase();
  if (!cleaned || !/^[0-9A-F]+$/i.test(cleaned)) return "";

  let binary = "";
  for (let i = 0; i < cleaned.length; i++) {
    const hexDigit = cleaned[i];
    const val = parseInt(hexDigit, 16);
    binary += val.toString(2).padStart(4, "0");
  }

  if (targetBitLength && binary.length < targetBitLength) {
    binary = padBits(binary, targetBitLength, "left", "0");
  }

  return binary;
}

/**
 * Converts an 8-character IEEE-754 single-precision hexadecimal representation into a decimal number.
 */
export function hexToDecimal(hex: string): number {
  const cleaned = hex.trim().replace(/^0x/i, "");
  if (cleaned.length !== 8) {
    // If fewer digits, left pad to 8 digits
    const padded = cleaned.padStart(8, "0");
    const num = parseInt(padded, 16);
    if (Number.isNaN(num)) return NaN;
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, num, false);
    return view.getFloat32(0, false);
  }

  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return NaN;

  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, num, false);
  return view.getFloat32(0, false);
}

/**
 * Converts a decimal number to an 8-character IEEE-754 single-precision uppercase hexadecimal string.
 */
export function decimalToHex(decimal: number): string {
  if (Number.isNaN(decimal)) return "7FC00000";
  if (decimal === Infinity) return "7F800000";
  if (decimal === -Infinity) return "FF800000";
  if (Object.is(decimal, -0)) return "80000000";
  if (decimal === 0) return "00000000";

  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, decimal, false);

  let hex = "";
  for (let i = 0; i < 4; i++) {
    hex += view.getUint8(i).toString(16).padStart(2, "0").toUpperCase();
  }
  return hex;
}
