import { extractSign, extractExponent, extractCoefficient, assembleIEEE, decodeIEEE } from "./ieee754";
import { isNaNValue, isPositiveInfinity, isNegativeInfinity, isNegativeZero, isPositiveZero, overflow, underflow } from "./specialCases";
import { binaryToHex } from "./hex";

export interface IEEEResult {
    decimal: number;
    sign: number;
    exponentBits: string;
    coefficient: string;
    binary: string;
    hex: string;
    decodedValue: number;
    specialCase: string | null;
}

// checks if the decimal is a special case (NaN, Infinity, etc)
// returns the label as a string if it is, or null if its just a normal number
function checkSpecialCase(decimal: number): string | null {
    if (isNaNValue(decimal)) return "NaN";
    if (isPositiveInfinity(decimal)) return "Infinity";
    if (isNegativeInfinity(decimal)) return "-Infinity";
    if (isNegativeZero(decimal)) return "-0";
    if (isPositiveZero(decimal)) return "+0";
    if (overflow(decimal)) return "Overflow";
    if (underflow(decimal)) return "Underflow";

    // no special case, its a normal number, proceed with regular conversion
    return null;
}


// builds the result object for special cases (NaN, Infinity, etc)
// uses predefined bit patterns instead of the normal math functions
// since things like Math.log2(Infinity) would break
function buildSpecialCaseResult(decimal: number, specialCase: string): IEEEResult {
    let sign = 0;
    let exponentBits = "00000000";
    let coefficient = "0".repeat(23);
    let decodedValue: number = decimal; // default, will override below per case

    if (specialCase === "NaN") {
        // exponent all 1s + nonzero coefficient = NaN (this is the actual IEEE rule)
        exponentBits = "11111111";
        coefficient = "1" + "0".repeat(22);
        decodedValue = NaN;
    } else if (specialCase === "Infinity") {
        // exponent all 1s + coefficient all 0s = infinity
        exponentBits = "11111111";
        decodedValue = Infinity;
    } else if (specialCase === "-Infinity") {
        sign = 1;
        exponentBits = "11111111";
        decodedValue = -Infinity;
    } else if (specialCase === "-0") {
        sign = 1;
        decodedValue = -0;
    } else if (specialCase === "+0") {
        sign = 0;
        decodedValue = 0;
    } else if (specialCase === "Overflow") {
        // too big to fit, rounds to infinity (keeping the original sign)
        sign = decimal < 0 ? 1 : 0;
        exponentBits = "11111111";
        decodedValue = sign === 1 ? -Infinity : Infinity;
    } else if (specialCase === "Underflow") {
        // too small to fit, flushes down to zero (keeping the original sign)
        sign = decimal < 0 ? 1 : 0;
        exponentBits = "00000000";
        decodedValue = sign === 1 ? -0 : 0;
    }

    const binary = sign.toString() + exponentBits + coefficient;
    const hex = binaryToHex(binary);

    return {
        decimal,
        sign,
        exponentBits,
        coefficient,
        binary,
        hex,
        decodedValue, // hardcoded per case above, not calculated with decodeIEEE
        specialCase,
    };
}

// main function
export function convertDecimalToIEEE(decimal: number): IEEEResult {
    const specialCase = checkSpecialCase(decimal);

    // if its a special case, build the result using the fixed bit patterns
    // and skip the normal math functions entirely (they'd break on these values)
    if (specialCase !== null) {
        return buildSpecialCaseResult(decimal, specialCase);
    }

    // normal case: call our ieee754 functions in order
    const sign = extractSign(decimal);
    const exponent = extractExponent(decimal);
    const coefficient = extractCoefficient(decimal);
    const binary = assembleIEEE(sign, exponent, coefficient);
    const hex = binaryToHex(binary);
    const decodedValue = decodeIEEE(binary);

    return {
        decimal,
        sign,
        exponentBits: exponent.toString(2).padStart(8, "0"),
        coefficient,
        binary,
        hex,
        decodedValue,
        specialCase: null,
    };
}