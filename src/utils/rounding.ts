// Specifies whether the input number is interpreted as decimal or binary.
export type InputType = "decimal" | "binary";

// Available rounding methods supported by the rounding engine.
export type RoundingMethod = "chop" | "up" | "down" | "nearest-even";

// Stores the output of each rounding method.
export interface RoundingResults
{
    chop: string;
    up: string;
    down: string;
    nearestEven: string;
}



// Applies all supported rounding methods to the given input.
// Returns the results of chopping, rounding up, rounding down,
// and round-to-nearest-even.
export function roundAll(value: string, digits: number, inputType: InputType): RoundingResults
{
    validateInput(value, digits, inputType);

    return {
        chop: chop(value, digits, inputType),
        up: roundUp(value, digits, inputType),
        down: roundDown(value, digits, inputType),
        nearestEven: roundNearestEven(value, digits, inputType)
    };
}

// Performs truncation by keeping only the required number of
// significant digits/bits and removing the remaining digits.
export function chop(value: string, digits: number, inputType: InputType): string
{
    if (inputType === "decimal")
    {
        return chopDecimal(value, digits);
    }

    return chopBinary(value, digits);
}

// Round the value towards positive infinity.
// For decimal input, positive values increase if discarded digits exist.
// For binary input, positive values increase if discarded bits exist.
export function roundUp (value: string, digits: number, inputType: InputType): string
{
    if (inputType === "decimal")
    {
        return roundUpDecimal(value, digits);
    }

    return roundUpBinary(value, digits);
}

// Round the value towards negative infinity.
// For decimal input, negative values decrease if discarded digits exist.
// For binary input, negative values decrease if discarded bits exist.
export function roundDown (value: string, digits: number, inputType: InputType): string
{
    if (inputType === "decimal")
    {
        return roundDownDecimal(value, digits);
    }

    return roundDownBinary(value, digits);
}

// Rounds the value using the IEEE 754 round-to-nearest, ties-to-even rule.
export function roundNearestEven(value: string,digits: number, inputType: InputType): string
{
    if (inputType === "decimal")
    {
        return roundNearestEvenDecimal(value, digits);
    }

    return roundNearestEvenBinary(value, digits);
}


/**
 * DECIMAL ROUNDING
 */

// Performs decimal chopping by truncating all digits beyond the specified number of significant digits.
function chopDecimal(value: string, digits: number): string
{
    const info = getDecimalInfo(value);

    if (info.significantDigits <= digits)
    {
        return value;
    }

    const kept = info.digits.substring(0, digits);

    return rebuildDecimal(info.sign, kept, info.decimalIndex, digits);
}

// Rounds a decimal number toward positive infinity.
function roundUpDecimal(value: string, digits: number): string
{
    const info = getDecimalInfo(value);

    if (info.significantDigits <= digits)
    {
        return value;
    }


    const truncated = info.digits.substring(0, digits);
    const discarded = info.digits.substring(digits);

    // Positive numbers move upward
    if (info.sign !== "-" && hasNonZero(discarded))
    {
        return rebuildDecimal("", incrementDigits(truncated), info.decimalIndex, digits);
    }

    // Negative numbers already become smaller as they are truncated
    return rebuildDecimal(info.sign, truncated, info.decimalIndex, digits);
}

// Rounds a decimal number toward negative infinity.
function roundDownDecimal(value: string, digits: number): string
{
    const info = getDecimalInfo(value);

    if (info.significantDigits <= digits)
    {
        return value;
    }


    const truncated = info.digits.substring(0, digits);
    const discarded = info.digits.substring(digits);

    // Negative numbers move downward
    if (info.sign === "-" && hasNonZero(discarded))
    {
        return rebuildDecimal("-", incrementDigits(truncated), info.decimalIndex, digits);
    }

    return rebuildDecimal(info.sign, truncated, info.decimalIndex, digits);
}

// Rounds a decimal number using the round-to-nearest, ties-to-even method.
function roundNearestEvenDecimal(value: string, digits: number): string
{
    const info = getDecimalInfo(value);

    if (info.significantDigits <= digits)
    {
        return value;
    }


    const kept = info.digits.substring(0, digits);
    const discarded = info.digits.substring(digits);

    const firstDiscarded = discarded[0];

    if (Number(firstDiscarded) < 5)
    {
        return rebuildDecimal(info.sign, kept, info.decimalIndex, digits);
    }

    if (Number(firstDiscarded) > 5)
    {
        return rebuildDecimal(info.sign, incrementDigits(kept), info.decimalIndex, digits);
    }


    // Ties to even when halfway
    const remaining = discarded.substring(1);

    if (hasNonZero(remaining))
    {
        return rebuildDecimal(info.sign, incrementDigits(kept), info.decimalIndex, digits);
    }

    const lastKept = Number(kept[kept.length - 1]);

    if (lastKept % 2 !== 0)
    {
        return rebuildDecimal(info.sign, incrementDigits(kept), info.decimalIndex, digits);
    }

    return rebuildDecimal(info.sign, kept, info.decimalIndex, digits);
}


/**
 * BINARY ROUNDING
 */

// Performs binary chopping by truncating all bits beyond the specified number of significant bits.
function chopBinary(value: string, digits: number): string
{
    const info = getBinaryInfo(value);

    if (info.significantBits <= digits)
    {
        return value;
    }

    const kept = info.bits.substring(0, digits);

    return rebuildBinary(info.sign, kept, info.binaryPoint);
}

// Round a binary number toward positive infinity.
function roundUpBinary(value: string, digits: number): string
{
    const info = getBinaryInfo(value);

    if (info.significantBits <= digits)
    {
        return value;
    }


    const kept = info.bits.substring(0, digits);
    const discarded = info.bits.substring(digits);

    // Positive numbers round toward +infinity
    if (info.sign !== "-" && hasNonZero(discarded))
    {
        return rebuildBinary("", incrementBinary(kept), info.binaryPoint);
    }

    return rebuildBinary(info.sign,kept,info.binaryPoint);
}

// Rounds a binary number toward negative infinity.
function roundDownBinary(value: string, digits: number): string
{
    const info = getBinaryInfo(value);

    if (info.significantBits <= digits)
    {
        return value;
    }


    const kept = info.bits.substring(0, digits);
    const discarded = info.bits.substring(digits);

    // Negative numbers round toward -infinity
    if (info.sign === "-" && hasNonZero(discarded))
    {
        return rebuildBinary("-",incrementBinary(kept),info.binaryPoint);
    }

    return rebuildBinary(info.sign,kept,info.binaryPoint);
}

// Rounds a binary number using the round-to-nearest, ties-to-even method.
function roundNearestEvenBinary(value: string, digits: number): string
{
    const info = getBinaryInfo(value);

    if (info.significantBits <= digits)
    {
        return value;
    }


    const kept = info.bits.substring(0, digits);
    const discarded = info.bits.substring(digits);

    const firstDiscarded = discarded[0];

    // Less than half
    if (firstDiscarded === "0")
    {
        return rebuildBinary(info.sign,kept,info.binaryPoint);
    }


    // Greater than half
    if (hasNonZero(discarded.substring(1)))
    {
        return rebuildBinary(info.sign,incrementBinary(kept),info.binaryPoint);
    }


    // Exactly halfway: ties-to-even
    const lastKept = kept[kept.length - 1];

    if (lastKept === "1")
    {
        return rebuildBinary(info.sign,incrementBinary(kept),info.binaryPoint);
    }

    return rebuildBinary(info.sign,kept,info.binaryPoint);
}


/**
 * HELPER FUNCTIONS
 */

// Validates the user input before any rounding operation.
// Ensures that the value format is correct and the requested number of digits is valid.
function validateInput(value: string, digits: number, inputType: InputType): void
{
    if (value.trim() === "")
    {
        throw new Error("Input cannot be empty.");
    }

    if (digits <= 0)
    {
        throw new Error("Digits must be greater than 0.");
    }

    if (inputType === "decimal")
    {
        if (!/^-?\d+(\.\d+)?$/.test(value))
        {
            throw new Error("Invalid decimal number.");
        }
    }
    else
    {
        if (!/^-?[01]+(\.[01]+)?$/.test(value))
        {
            throw new Error("Invalid binary number.");
        }
    }
}

// Separates a number into its sign, integer part, and fractional part for easier processing.
function splitNumber(value: string)
{
    let sign = "";

    if (value.startsWith("-"))
    {
        sign = "-";
        value = value.substring(1);
    }

    const parts = value.split(".");

    return {
        sign,
        integer: parts[0],
        fraction: parts[1] ?? ""
    };
}

// Extracts decimal information needed for rounding.
function getDecimalInfo(value: string)
{
    const { sign, integer, fraction } = splitNumber(value);

    // Remove leading zeros only for significant digit counting
    let digits = integer + fraction;
    let leadingZeros = 0;

    while (digits.length > 0 && digits[0] === "0")
    {
        leadingZeros++;
        digits = digits.substring(1);
    }

    // Handle numbers like 0.00045
    if (digits.length === 0)
    {
        digits = "0";
    }

    return {
        sign,
        digits, // All meaningful digits
        significantDigits: digits.length, // Number of significant digits
        decimalIndex: integer.length - leadingZeros // Position where decimal point belongs
    };
}

// Rebuilds a decimal number after rounding.
function rebuildDecimal(sign: string,digits: string,decimalIndex: number,originalDigits: number): string
{
    let point = decimalIndex;

    // If rounding caused overflow
    if (digits.length > originalDigits)
    {
        point++;
    }


    let result: string;

    if (point <= 0) // Decimal point before all digits
    {
        result ="0." + "0".repeat(Math.abs(point)) + digits;
    }
    else if (point >= digits.length) // Decimal point after all digits
    {
        result = digits + "0".repeat(point - digits.length);
    }
    else // Decimal point inside digits
    {
        result = digits.substring(0, point) + "." + digits.substring(point);
    }

    // Remove unnecessary decimal point
    if (result.includes("."))
    {
        result = result.replace(/\.?0+$/, "");
    }

    // Restore zero if needed
    if (result === "")
    {
        result = "0";
    }

    return sign + result;
}

// Extracts binary information needed for rounding.
function getBinaryInfo(value: string)
{
    const { sign, integer, fraction } = splitNumber(value);
    const bits = integer + fraction;

    return {
        sign,
        bits,
        binaryPoint: integer.length,
        significantBits: bits.replace(/^0+/, "").length
    };
}

// Rebuilds a binary number after rounding.
function rebuildBinary(sign: string,bits: string,binaryPoint: number): string
{
    if (bits.length === 0)
    {
        return "0";
    }

    let point = binaryPoint;

    // Handles carry overflow after rounding
    // Example: 111 -> 1000
    if (bits.length > binaryPoint && bits[0] === "1" && point === bits.length - 1)
    {
        point++;
    }

    if (point <= 0)
    {
        return sign + "0." + "0".repeat(Math.abs(point)) + bits;
    }

    if (point >= bits.length)
    {
        return sign + bits + "0".repeat(point - bits.length);
    }

    return (sign +bits.substring(0, point) + "." + bits.substring(point));
}

// Adds one to a binary string while handling carries.
function incrementBinary(bits: string): string
{
    let result = bits.split("");
    let carry = true;

    for (let i = result.length - 1; i >= 0; i--)
    {
        if (!carry)
        {
            break;
        }

        if (result[i] === "0")
        {
            result[i] = "1";
            carry = false;
        }
        else
        {
            result[i] = "0";
        }
    }

    if (carry)
    {
        result.unshift("1");
    }

    return result.join("");
}

// Adds one to a decimal digit string while handling carries.
function incrementDigits(value: string): string
{
    let digits = value.split("");
    let carry = true;

    for (let i = digits.length - 1; i >= 0; i--)
    {
        if (!carry)
        {
            break;
        }

        let number = Number(digits[i]) + 1;

        if (number === 10)
        {
            digits[i] = "0";
        }
        else
        {
            digits[i] = String(number);
            carry = false;
        }
    }

    if (carry)
    {
        digits.unshift("1");
    }

    return digits.join("");
}

// Checks whether the discarded portion contains any non-zero digit or bit.
function hasNonZero(value: string): boolean
{
    return value.includes("1") || /[1-9]/.test(value);
}