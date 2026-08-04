export type InputType = "decimal" | "binary";
export type RoundingMethod = "chop" | "up" | "down" | "nearest-even";

export interface RoundingResults
{
    chop: string;
    up: string;
    down: string;
    nearestEven: string;
}


/**
 * Returns all four rounding methods.
 */
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

export function chop(value: string, digits: number, inputType: InputType): string
{
    if (inputType === "decimal")
    {
        return chopDecimal(value, digits);
    }

    return chopBinary(value, digits);
}

export function roundUp (value: string, digits: number, inputType: InputType): string
{
    if (inputType === "decimal")
    {
        return roundUpDecimal(value, digits);
    }

    return roundUpBinary(value, digits);
}

export function roundDown (value: string, digits: number, inputType: InputType): string
{
    if (inputType === "decimal")
    {
        return roundDownDecimal(value, digits);
    }

    return roundDownBinary(value, digits);
}

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

function roundUpDecimal(value: string, digits: number): string
{
    const info = getDecimalInfo(value);

    if (info.significantDigits <= digits)
    {
        return value;
    }


    const truncated = info.digits.substring(0, digits);
    const discarded = info.digits.substring(digits);

    //Positive numbers move upward
    if (info.sign !== "-" && hasNonZero(discarded))
    {
        return rebuildDecimal("", incrementDigits(truncated), info.decimalIndex, digits);
    }

    //Negative numbers already become smaller as they are truncated
    return rebuildDecimal(info.sign, truncated, info.decimalIndex, digits);
}

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


    //Ties to even when halfway
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

/**
 * Extracts decimal information needed for rounding.
 */
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

        // All meaningful digits
        digits,

        // Number of significant digits
        significantDigits: digits.length,

        // Position where decimal point belongs
        decimalIndex: integer.length - leadingZeros
    };
}

/**
 * Rebuilds a decimal number after rounding.
 */
function rebuildDecimal(sign: string,digits: string,decimalIndex: number,originalDigits: number): string
{
    let point = decimalIndex;

    // If rounding caused overflow
    if (digits.length > originalDigits)
    {
        point++;
    }


    let result: string;

    // Decimal point before all digits
    if (point <= 0)
    {
        result ="0." + "0".repeat(Math.abs(point)) + digits;
    }

    // Decimal point after all digits
    else if (point >= digits.length)
    {
        result = digits + "0".repeat(point - digits.length);
    }

    // Decimal point inside digits
    else
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

function rebuildBinary(sign: string,bits: string,binaryPoint: number): string
{
    if (bits.length === 0)
    {
        return "0";
    }

    let point = binaryPoint;
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

function hasNonZero(value: string): boolean
{
    return value.includes("1") || /[1-9]/.test(value);
}