import { describe, it, expect } from "vitest";
import {
  decimalToBinary,
  binaryToDecimal,
  normalizeBinary,
  padBits,
  removeLeadingZeros,
  removeTrailingZeros,
  groupBits,
} from "../binary";

describe("Member 5 Binary Utilities Tests", () => {
  it("should convert positive integers to binary", () => {
    expect(decimalToBinary(13)).toBe("1101");
    expect(decimalToBinary(0)).toBe("0");
  });

  it("should convert negative integers to binary string", () => {
    expect(decimalToBinary(-13)).toBe("-1101");
    expect(decimalToBinary(-0)).toBe("-0");
  });

  it("should convert fractional numbers to binary", () => {
    expect(decimalToBinary(13.25)).toBe("1101.01");
    expect(decimalToBinary(0.625)).toBe("0.101");
  });

  it("should convert binary strings back to decimal numbers", () => {
    expect(binaryToDecimal("1101")).toBe(13);
    expect(binaryToDecimal("1101.01")).toBe(13.25);
    expect(binaryToDecimal("-1101.01")).toBe(-13.25);
    expect(binaryToDecimal("0.101")).toBe(0.625);
  });

  it("should handle invalid binary input safely", () => {
    expect(binaryToDecimal("invalid")).toBeNaN();
    expect(binaryToDecimal("102.1")).toBeNaN();
  });

  it("should normalize binary strings correctly", () => {
    const norm1 = normalizeBinary("110.101");
    expect(norm1.mantissa).toBe("1.10101");
    expect(norm1.exponent).toBe(2);
    expect(norm1.isNegative).toBe(false);

    const norm2 = normalizeBinary("0.00101");
    expect(norm2.mantissa).toBe("1.01");
    expect(norm2.exponent).toBe(-3);
  });

  it("should pad bits correctly", () => {
    expect(padBits("101", 8, "left")).toBe("00000101");
    expect(padBits("101", 8, "right")).toBe("10100000");
  });

  it("should remove leading and trailing zeros", () => {
    expect(removeLeadingZeros("0001101")).toBe("1101");
    expect(removeTrailingZeros("101000")).toBe("101");
  });

  it("should group bits with spaces", () => {
    expect(groupBits("111011011")).toBe("1110 1101 1");
  });
});
