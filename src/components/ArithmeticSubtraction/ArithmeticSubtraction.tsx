import { useState } from "react";
import { subtractIEEE } from "../../utils/subtraction";
import type { SubtractionResult } from "../../utils/subtraction";

// inserts a space every 4 characters, ex. "111011011" => "1110 1101 1"
function groupBits(bits: string): string {
  return bits.match(/.{1,4}/g)?.join(" ") ?? bits;
}

export default function ArithmeticSubtraction() {
  const [aValue, setAValue] = useState("");
  const [bValue, setBValue] = useState("");
  const [result, setResult] = useState<SubtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCompute() {
    const a = parseFloat(aValue);
    const b = parseFloat(bValue);

    if (Number.isNaN(a) && aValue.trim().toLowerCase() !== "nan") {
      setError("Operand A is not a valid number.");
      setResult(null);
      return;
    }
    if (Number.isNaN(b) && bValue.trim().toLowerCase() !== "nan") {
      setError("Operand B is not a valid number.");
      setResult(null);
      return;
    }

    setError(null);
    setResult(subtractIEEE(a, b));
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Arithmetic — Subtraction</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-2 font-medium">Operand A</label>
          <input
            type="text"
            value={aValue}
            onChange={(e) => setAValue(e.target.value)}
            placeholder="e.g. 13.25"
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Operand B</label>
          <input
            type="text"
            value={bValue}
            onChange={(e) => setBValue(e.target.value)}
            placeholder="e.g. 5.5"
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      <button
        onClick={handleCompute}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Subtract (A − B)
      </button>

      {error && <p className="text-red-600 font-medium mt-4">{error}</p>}

      {result && (
        <div className="mt-6 space-y-6">
          {result.specialCase && (
            <p className="text-orange-600 font-medium">
              Special case: {result.specialCase}
            </p>
          )}

          {/* step-by-step trace */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Step-by-step</h2>
            <ol className="space-y-3">
              {result.steps.map((step, i) => (
                <li key={i} className="border rounded p-3">
                  <p className="font-medium">
                    {i + 1}. {step.title}
                  </p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 mt-1">
                    {step.detail}
                  </pre>
                </li>
              ))}
            </ol>
          </div>

          {/* final answer */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Final Result</h2>
            <p>
              <strong>Decimal:</strong>{" "}
              {Object.is(result.decimal, -0) ? "-0" : result.decimal}
            </p>
            <p>
              <strong>Binary:</strong> {result.sign} {groupBits(result.exponentBits)}{" "}
              {groupBits(result.coefficient)}
            </p>
            <p>
              <strong>Hex:</strong> {groupBits(result.hex)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
