import React, { useState } from "react";
import Card from "../components/shared/Card";
import SectionHeader from "../components/shared/SectionHeader";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";
import OutputPanel from "../components/shared/OutputPanel";

import { roundAll } from "../utils/rounding";
import type { RoundingResults, InputType } from "../utils/rounding";


export const Rounding: React.FC = () => {
  const [inputValue, setInputValue] = useState("123.456789");
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
        description="Demonstrates chopping, round-up, round-down, and round-to-nearest-even on decimal or binary inputs."
        badge="Member 2 Engine"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Input Settings" className="md:col-span-1 space-y-4">
          <Input
            label="Input Number (Decimal or Binary)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 123.456789"
          />
          <select
            value={inputType}
            onChange={(e) =>
              setInputType(e.target.value as InputType)
            }
            className="border rounded px-3 py-2 w-full"
          >
            <option value="decimal">Decimal</option>
            <option value="binary">Binary</option>
          </select>
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
