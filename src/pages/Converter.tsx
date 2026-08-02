import { useState } from "react";
import { convertDecimalToIEEE } from "../utils/decimalConverter";
import type { IEEEResult } from "../utils/decimalConverter";

// inserts a space every 4 characters, ex. "111011011" => "1110 1101 1"
function groupBits(bits: string): string {
    return bits.match(/.{1,4}/g)?.join(" ") ?? bits;
}

export default function Converter() {
    // state #1: what the user is currently typing in the input box
    const [inputValue, setInputValue] = useState("");

    // state #2: the conversion result, null until they click Convert
    const [result, setResult] = useState<IEEEResult | null>(null);

    // runs when the Convert button is clicked
    function handleConvert() {
        const parsed = parseFloat(inputValue); // turn the text into a number
        const converted = convertDecimalToIEEE(parsed);
        setResult(converted); // save it to state, this triggers a re-render
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Converter</h1>

        {/* input box */}
        <label className="block mb-2 font-medium">Input</label>
        <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 123.456"
            className="border rounded px-3 py-2 w-full mb-4"
        />

        {/* button */}
        <button
            onClick={handleConvert}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Convert
        </button>

        {/* only show results if we actually have a result */}
        {result && (
            <div className="mt-6 space-y-2">
            <h2 className="text-xl font-semibold">Output</h2>
            {result.specialCase && (
                <p className="text-orange-600 font-medium">
                Special case: {result.specialCase}
                </p>
            )}
            <p><strong>Sign:</strong> {result.sign}</p>
            <p><strong>Exponent:</strong> {groupBits(result.exponentBits)}</p>
            <p><strong>Coefficient:</strong> {groupBits(result.coefficient)}</p>
            <p><strong>Binary:</strong> {result.sign} {groupBits(result.exponentBits)} {groupBits(result.coefficient)}</p>
            <p><strong>Hex:</strong> {groupBits(result.hex)}</p>
            <p><strong>Decoded (verification):</strong> {result.decodedValue}</p>
            </div>
        )}
        </div>
    );
}