import { useState } from "react";
import { roundAll } from "../utils/rounding";
import type { RoundingResults, InputType } from "../utils/rounding";


export default function Rounding()
{
    // What the user types
    const [inputValue, setInputValue] = useState("");

    // Number of significant digits to keep
    const [digits, setDigits] = useState(4);

    // Decimal or binary input
    const [inputType, setInputType] = useState<InputType>("decimal");

    // Stores output after clicking Round
    const [result, setResult] = useState<RoundingResults | null>(null);

    // Stores possible errors
    const [error, setError] = useState("");


    function handleRound()
    {
        try
        {
            setError("");

            const rounded = roundAll(
                inputValue,
                digits,
                inputType
            );

            setResult(rounded);
        }
        catch (err)
        {
            setResult(null);
            setError((err as Error).message);
        }
    }


    return (
        <div className="p-6 max-w-xl mx-auto">

            <h1 className="text-2xl font-bold mb-4">
                Rounding
            </h1>


            {/* Input */}
            <label className="block mb-2 font-medium">
                Input
            </label>

            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. 123.456789"
                className="border rounded px-3 py-2 w-full mb-4"
            />


            {/* Input Type */}
            <label className="block mb-2 font-medium">
                Input Type
            </label>

            <select
                value={inputType}
                onChange={(e) =>
                    setInputType(e.target.value as InputType)
                }
                className="border rounded px-3 py-2 w-full mb-4"
            >
                <option value="decimal">
                    Decimal
                </option>

                <option value="binary">
                    Binary
                </option>

            </select>


            {/* Digits */}
            <label className="block mb-2 font-medium">
                Target Digits
            </label>

            <input
                type="number"
                min="1"
                value={digits}
                onChange={(e) =>
                    setDigits(Number(e.target.value))
                }
                className="border rounded px-3 py-2 w-full mb-4"
            />


            {/* Button */}
            <button
                onClick={handleRound}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Round
            </button>


            {/* Error */}
            {error && (
                <p className="mt-4 text-red-600">
                    {error}
                </p>
            )}


            {/* Results */}
            {result && (
                <div className="mt-6 space-y-2">

                    <h2 className="text-xl font-semibold">
                        Results
                    </h2>


                    <p>
                        <strong>Chopping:</strong>{" "}
                        {result.chop}
                    </p>


                    <p>
                        <strong>Round Up:</strong>{" "}
                        {result.up}
                    </p>


                    <p>
                        <strong>Round Down:</strong>{" "}
                        {result.down}
                    </p>


                    <p>
                        <strong>
                            Round-to-nearest-even:
                        </strong>{" "}
                        {result.nearestEven}
                    </p>

                </div>
            )}

        </div>
    );
}