import React, { useState } from "react";
import Card from "../components/shared/Card";
import SectionHeader from "../components/shared/SectionHeader";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";
import OutputPanel from "../components/shared/OutputPanel";

import { roundAll } from "../utils/rounding";
import type { RoundingResults, InputType } from "../utils/rounding";


export const Rounding: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [digits, setDigits] = useState("4");
  const [results, setResults] = useState<RoundingResults | null>(null);
  const [inputType, setInputType] = useState<InputType>("decimal");

  const handleRound = () => {
      try {
          const result = roundAll(
              inputValue,
              parseInt(digits, 10),
              inputType
          );

          setResults(result);
      }
      catch {
          setResults(null);
      }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SectionHeader
        title="Module 2: Rounding Engine"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Input Settings" className="md:col-span-1 space-y-4">
          <Input
            label="Input Number (Decimal or Binary)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 123.456789"
          />
          <div className="w-full">
            <label htmlFor="input-type" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Input Representation
            </label>
            <select
              id="input-type"
              value={inputType}
              onChange={(e) =>
                setInputType(e.target.value as InputType)
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              <option value="decimal" className="bg-slate-900 text-slate-100">Decimal</option>
              <option value="binary" className="bg-slate-900 text-slate-100">Binary</option>
            </select>
          </div>
          <Input
            label="Target Digits/Bits"
            type="number"
            value={digits}
            onChange={(e) => setDigits(e.target.value)}
            placeholder="e.g. 4"
          />
          <Button onClick={handleRound} className="w-full">
            Demonstrate Rounding
          </Button>
        </Card>

        <Card title="Rounding Method Results" className="md:col-span-2 space-y-3">
          {results ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <OutputPanel label="Chopping (Truncation)" value={results.chop} badge="Chop" />
              <OutputPanel label="Round Up (+Infinity)" value={results.up} badge="Up" />
              <OutputPanel label="Round Down (-Infinity)" value={results.down} badge="Down" />
              <OutputPanel label="Round to Nearest (Ties to Even)" value={results.nearestEven} badge="Nearest-Even" highlight />
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm">
              Enter target value and digits above, then click Demonstrate Rounding.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Rounding;
