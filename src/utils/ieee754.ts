export function extractSign(decimal: number): number {
    /* If decimal is less than 0, negative, or negative zero (-0),
    return 1. else, return 0 or positive */
    if (Object.is(decimal, -0) || decimal < 0) {
        return 1;
    }
    return 0;
}

export function extractExponent(decimal: number): number {
    const absoluteNum: number = Math.abs(decimal);
    let exponent: number = 0;
    if (absoluteNum == 0) {
        // Special case: 0 has no meaningful exponent, so we just return 0.
        return 0
    } else {
        // Math.log2 gives us the power of 2 the number is closest to.
        // Math.floor rounds it down to get the unbiased exponent
        // (this matches normalizing to 1.xxx x 2^exponent by hand).
        // We add 127 because IEEE 754 single-precision uses a bias of 127.
        exponent = Math.floor(Math.log2(absoluteNum)) + 127;
    }
    
    return exponent;
}

export function extractCoefficient(decimal: number): string {
    const absoluteNum: number = Math.abs(decimal);
    const unbiasedExp: number = Math.floor(Math.log2(absoluteNum));
    
    // normalize: divide by 2^unbiasedExp to get a number like 1.xxxx
    const normalized: number = absoluteNum / Math.pow(2, unbiasedExp);
    
    // remove the leading 1, we don't store it (its implied/hidden bit)
    // this leaves just the fraction part, e.g. 0.929
    let fraction: number = normalized - 1;

    let coefficient: string = "";

    /* convert the fraction to binary, bit by bit, if result >= 1 write down 1 and subtract 1, else write down 0.
    repeat 23 times since coefficient is 23 bits */
    for (let i = 0; i < 23; i++) {
        fraction = fraction * 2;
        if (fraction >= 1) {
        coefficient += "1";
        fraction -= 1;
        } else {
        coefficient += "0";
        }
    }

    // note!!: this chops/truncates instead of rounding
    return coefficient;
}

export function assembleIEEE(sign: number, exponent: number, coefficient: string): string {
    /* exponent is currently a decimal number (ex. 133), we need it as
    an 8-bit binary string (ex. "10000101") to merge everything together */ 
    const exponentBinary: string = exponent.toString(2).padStart(8, "0");

    /* merge sign + exponent bits + coefficient bits together = 32 bits total
    sign.toString() because sign is a number (0 or 1), need it as a string to concatenate*/ 
    return sign.toString() + exponentBinary + coefficient;
}

export function decodeIEEE(binary: string): number {
    // split the 32-bit string into its three parts
    const signBit: string = binary[0];
    const exponentBits: string = binary.slice(1, 9);
    const coefficientBits: string = binary.slice(9);

    // "1" means negative, so multiply by -1, else keep positive
    const sign: number = signBit === "1" ? -1 : 1;

    // parseInt(str, 2) turns a binary string into a decimal number
    // subtract 127 to undo the bias we added before
    const exponent: number = parseInt(exponentBits, 2) - 127;

    // add up each bit's value: bit 0 = 2^-1, bit 1 = 2^-2, etc.
    // (reverse of how built the coefficient bit by bit earlier)
    let fraction: number = 0;
    for (let i = 0; i < coefficientBits.length; i++) {
        if (coefficientBits[i] === "1") {
        fraction += Math.pow(2, -(i + 1));
        }
    }

    // put it back together: sign * (1.fraction) * 2^exponent
    return sign * (1 + fraction) * Math.pow(2, exponent);
}