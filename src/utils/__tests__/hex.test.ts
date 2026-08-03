import { describe, it, expect } from "vitest";
import { binaryToHex, hexToBinary, hexToDecimal, decimalToHex } from "../hex";

describe("Member 5 Hexadecimal Utilities Tests", () => {
  it("should convert binary to hex uppercase", () => {
    expect(binaryToHex("01000001111101101110100101111001")).toBe("41F6E979");
    expect(binaryToHex("1101")).toBe("D");
  });

  it("should convert hex to binary", () => {
    expect(hexToBinary("41F6E979")).toBe("01000001111101101110100101111001");
    expect(hexToBinary("D")).toBe("1101");
  });

  it("should convert decimal to 8-character IEEE-754 single precision hex", () => {
    expect(decimalToHex(123.456)).toBe("42F6E979");
    expect(decimalToHex(0)).toBe("00000000");
    expect(decimalToHex(-0)).toBe("80000000");
    expect(decimalToHex(Infinity)).toBe("7F800000");
    expect(decimalToHex(-Infinity)).toBe("FF800000");
    expect(decimalToHex(NaN)).toBe("7FC00000");
  });

  it("should convert IEEE single precision hex to decimal float", () => {
    expect(hexToDecimal("42F6E979")).toBeCloseTo(123.456, 3);
    expect(hexToDecimal("00000000")).toBe(0);
    expect(hexToDecimal("7F800000")).toBe(Infinity);
    expect(hexToDecimal("FF800000")).toBe(-Infinity);
  });

  it("should handle invalid hex input safely", () => {
    expect(binaryToHex("invalid")).toBe("INVALID");
    expect(hexToBinary("G123")).toBe("");
  });
});
