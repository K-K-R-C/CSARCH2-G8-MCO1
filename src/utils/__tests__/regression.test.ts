import { describe, it, expect } from "vitest";
import { convertDecimalToIEEE } from "../decimalConverter";
import { groupBits } from "../binary";

describe("Member 5 Regression & Format Consistency Tests", () => {
  it("should format binary spacing consistently across outputs", () => {
    const res = convertDecimalToIEEE(123.456);
    expect(res.sign).toBe(0);
    expect(res.exponentBits.length).toBe(8);
    expect(res.coefficient.length).toBe(23);

    const spacedBinary = `${res.sign} ${groupBits(res.exponentBits)} ${groupBits(res.coefficient)}`;
    expect(spacedBinary).toContain("0 1000 0101 1110 1101");
  });

  it("should convert special cases with correct bit patterns", () => {
    const nanRes = convertDecimalToIEEE(NaN);
    expect(nanRes.specialCase).toBe("NaN");
    expect(nanRes.exponentBits).toBe("11111111");

    const infRes = convertDecimalToIEEE(Infinity);
    expect(infRes.specialCase).toBe("Infinity");
    expect(infRes.sign).toBe(0);
    expect(infRes.exponentBits).toBe("11111111");

    const negInfRes = convertDecimalToIEEE(-Infinity);
    expect(negInfRes.specialCase).toBe("-Infinity");
    expect(negInfRes.sign).toBe(1);

    const negZeroRes = convertDecimalToIEEE(-0);
    expect(negZeroRes.specialCase).toBe("-0");
    expect(negZeroRes.sign).toBe(1);
  });
});
