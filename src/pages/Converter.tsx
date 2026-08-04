import { useState } from "react";
import { convertDecimalToIEEE } from "../utils/decimalConverter";
import type { IEEEResult } from "../utils/decimalConverter";
import Card from "../components/shared/Card";
import SectionHeader from "../components/shared/SectionHeader";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";
import OutputPanel from "../components/shared/OutputPanel";

export default function Converter() {
  // state #1: what the user is currently typing in the input box
  const [inputValue, setInputValue] = useState("");

  // state #2: the conversion result, null until they click Convert
  const [result, setResult] = useState<IEEEResult | null>(null);

  // runs when the Convert button is clicked
  function handleConvert() {
    let parsed: number = parseFloat(inputValue);
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed === "-0") {
      parsed = -0;
    } else if (trimmed === "nan") {
      parsed = NaN;
    } else if (trimmed === "infinity" || trimmed === "+infinity") {
      parsed = Infinity;
    } else if (trimmed === "-infinity") {
      parsed = -Infinity;
    }

    const converted = convertDecimalToIEEE(parsed);
    setResult(converted);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SectionHeader
        title="Module 1: Converter Engine"
        description="Convert decimal values into IEEE-754 decimal 32-bit single-precision floating point binary and hexadecimal formats."
        badge="Member 1 Engine"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Decimal Input" className="md:col-span-1 space-y-4">
          <Input
            label="Decimal Value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 123.456, -0, NaN, Infinity"
            helperText="Supports numbers, -0, NaN, and ±Infinity"
          />
          <Button onClick={handleConvert} className="w-full">
            Convert to IEEE-754
          </Button>
        </Card>

        <Card title="Conversion Output" className="md:col-span-2 space-y-3">
          {result ? (
            <div className="space-y-3">
              {result.specialCase && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-amber-300 text-xs font-semibold flex items-center justify-between">
                  <span>Special Case Triggered</span>
                  <span className="bg-amber-900/80 px-2 py-0.5 rounded font-mono uppercase">{result.specialCase}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <OutputPanel label="Sign Bit" value={result.sign} badge="1 bit" />
                <OutputPanel label="Exponent (Biased)" value={groupBitsFromRight(result.exponentBits)} badge="8 bits" />
                <OutputPanel label="Coefficient / Mantissa" value={groupBitsFromRight(result.coefficient)} badge="23 bits" />
              </div>

              <OutputPanel
                label="Complete Spaced Binary"
                value={`${result.sign} ${groupBitsFromRight(result.exponentBits)} ${groupBitsFromRight(result.coefficient)}`}
                badge="32 bits"
                highlight
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OutputPanel label="Hexadecimal" value={groupBitsFromRight(result.hex)} badge="8 Hex Digits" />
                <OutputPanel label="Decoded Verification" value={result.decodedValue} badge="Float32 Decoded" />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Enter a decimal number above and click Convert to IEEE-754.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// local version of groupBits that groups from the right instead of the left
// (so the "odd" leftover chunk, if any, ends up at the start not the end)
// kept local here
function groupBitsFromRight(bits: string, groupSize: number = 4): string {
  const reversed = bits.split("").reverse().join("");
  const regex = new RegExp(`.{1,${groupSize}}`, "g");
  const chunks = reversed.match(regex) ?? [];
  return chunks.map((chunk) => chunk.split("").reverse().join("")).reverse().join(" ");
}