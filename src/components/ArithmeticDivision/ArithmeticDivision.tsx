import { useState } from "react";
import { divideIEEE754, groupBits } from "../../utils/division";
import type { DivisionResult } from "../../utils/division";

export default function ArithmeticDivision() {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [result, setResult] = useState<DivisionResult | null>(null);
  const [showDecomp, setShowDecomp] = useState(false);
  const [showTrace, setShowTrace] = useState(true);

  function handleDivide() {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);

    // allow NaN inputs — they're a valid special case
    const divResult = divideIEEE754(
      inputA.toLowerCase() === "nan" ? NaN : a,
      inputB.toLowerCase() === "nan" ? NaN : b
    );
    setResult(divResult);
    setShowTrace(true);
  }

  /** Render the binary string with colored segments */
  function renderColoredBinary(binary: string) {
    const sign = binary[0];
    const exponent = binary.slice(1, 9);
    const significand = binary.slice(9);
    return (
      <>
        <span className="text-red-500 font-semibold">{sign}</span>
        {" "}
        <span className="text-blue-500 font-semibold">{groupBits(exponent)}</span>
        {" "}
        <span className="text-green-500 font-semibold">{groupBits(significand)}</span>
      </>
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleDivide();
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 text-left">
      <h1 className="text-3xl font-medium text-center mb-1">IEEE 754 Division</h1>
      <p className="text-center text-gray-500 mb-8">
        Divide two single-precision floating-point numbers with step-by-step trace
      </p>

      {/* --- Inputs --- */}
      <div className="flex gap-4 items-end mb-6">
        <div className="flex-1 flex flex-col gap-1">
          <label htmlFor="division-input-a" className="text-sm font-medium">Dividend (A)</label>
          <input
            id="division-input-a"
            type="text"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 10"
            className="font-mono text-base px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <span className="text-2xl font-medium text-purple-500 pb-2 select-none">÷</span>
        <div className="flex-1 flex flex-col gap-1">
          <label htmlFor="division-input-b" className="text-sm font-medium">Divisor (B)</label>
          <input
            id="division-input-b"
            type="text"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 3"
            className="font-mono text-base px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      <button
        id="division-btn"
        onClick={handleDivide}
        className="w-full py-3 text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 active:scale-[0.985] transition-all mb-8"
      >
        Divide
      </button>

      {/* --- Result Card --- */}
      {result && (
        <>
          <div className="border rounded-xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b flex items-center gap-3">
              <h2 className="text-lg font-medium m-0">Result</h2>
              {result.specialCase && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                  {result.specialCase}
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-baseline">
                <span className="text-sm text-gray-500 text-right">Decimal</span>
                <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {Number.isNaN(result.resultDecimal) ? "NaN"
                    : Object.is(result.resultDecimal, -0) ? "-0"
                      : result.resultDecimal}
                </span>

                <span className="text-sm text-gray-500 text-right">Sign</span>
                <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {result.resultSign} ({result.resultSign === 0 ? "+" : "−"})
                </span>

                <span className="text-sm text-gray-500 text-right">Exponent</span>
                <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {groupBits(result.resultExponent.toString(2).padStart(8, "0"))} ({result.resultExponent})
                </span>

                <span className="text-sm text-gray-500 text-right">Significand</span>
                <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {groupBits(result.resultSignificand)}
                </span>

                <span className="text-sm text-gray-500 text-right">Binary (32-bit)</span>
                <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded break-all tracking-wide">
                  {renderColoredBinary(result.resultBinary)}
                </span>

                <span className="text-sm text-gray-500 text-right">Hexadecimal</span>
                <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {result.resultHex}
                </span>
              </div>

              <div className="flex gap-4 justify-center mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Sign</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Exponent</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Significand</span>
              </div>
            </div>
          </div>

          {/* --- Input Decomposition (collapsible) --- */}
          <div className="border rounded-xl overflow-hidden mb-6">
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between cursor-pointer select-none hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
              onClick={() => setShowDecomp(!showDecomp)}
            >
              <h2 className="text-base font-medium m-0">Input Decomposition</h2>
              <span className={`text-sm text-gray-500 transition-transform ${showDecomp ? "rotate-180" : ""}`}>▼</span>
            </div>
            {showDecomp && (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm font-medium text-purple-500 mb-2">A = {result.inputA}</h3>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 items-baseline text-sm">
                    <span className="text-gray-500 text-right">Sign</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{result.signA}</span>
                    <span className="text-gray-500 text-right">Exponent</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {groupBits(result.exponentA.toString(2).padStart(8, "0"))} ({result.exponentA})
                    </span>
                    <span className="text-gray-500 text-right">Significand</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{groupBits(result.significandA)}</span>
                    <span className="text-gray-500 text-right">Binary</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded break-all">{renderColoredBinary(result.binaryA)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-purple-500 mb-2">B = {result.inputB}</h3>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 items-baseline text-sm">
                    <span className="text-gray-500 text-right">Sign</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{result.signB}</span>
                    <span className="text-gray-500 text-right">Exponent</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {groupBits(result.exponentB.toString(2).padStart(8, "0"))} ({result.exponentB})
                    </span>
                    <span className="text-gray-500 text-right">Significand</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{groupBits(result.significandB)}</span>
                    <span className="text-gray-500 text-right">Binary</span>
                    <span className="font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded break-all">{renderColoredBinary(result.binaryB)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- Step-by-Step Trace (collapsible) --- */}
          <div className="border rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between cursor-pointer select-none hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
              onClick={() => setShowTrace(!showTrace)}
            >
              <h2 className="text-base font-medium m-0">Step-by-Step Trace</h2>
              <span className={`text-sm text-gray-500 transition-transform ${showTrace ? "rotate-180" : ""}`}>▼</span>
            </div>
            {showTrace && (
              <div>
                {result.steps.map((step, i) => (
                  <div key={i} className="px-5 py-4 border-b last:border-b-0 hover:bg-purple-50/50 dark:hover:bg-purple-900/5 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{step.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5 ml-8.5 pl-[34px]">{step.description}</p>
                    {step.details && (
                      <pre className="font-mono text-xs leading-relaxed bg-gray-100 dark:bg-gray-800 rounded-md px-3.5 py-2.5 mt-2 ml-[34px] whitespace-pre-wrap break-all">
                        {step.details}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
