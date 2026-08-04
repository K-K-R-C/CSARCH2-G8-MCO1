import React, { useState } from "react";
import Card from "../components/shared/Card";
import SectionHeader from "../components/shared/SectionHeader";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";
import OutputPanel from "../components/shared/OutputPanel";
import StepViewer, { type StepItem } from "../components/StepViewer/StepViewer";
import { propagateSpecialCase } from "../utils/specialCases";
import { decimalToHex, hexToBinary } from "../utils/hex";
import { groupBits, decimalToBinary } from "../utils/binary";

export const Arithmetic: React.FC = () => {
  const [operandA, setOperandA] = useState("");
  const [operandB, setOperandB] = useState("");
  const [operation, setOperation] = useState<"subtraction" | "division">("subtraction");

  const [resultDecimal, setResultDecimal] = useState<string | null>(null);
  const [resultBinary, setResultBinary] = useState<string | null>(null);
  const [resultHex, setResultHex] = useState<string | null>(null);
  const [stepTrace, setStepTrace] = useState<StepItem[]>([]);

  const handleCompute = () => {
    const specialCase = propagateSpecialCase(operandA, operandB, operation);

    const valA = parseFloat(operandA);
    const valB = parseFloat(operandB);

    // --- HANDLE SPECIAL CASES (Infinity, NaN, Zero) ---
    if (specialCase !== null) {
      setResultDecimal(specialCase);

      // Map text to actual IEEE-754 32-bit bit patterns
      const specialHexMap: Record<string, string> = {
        "NaN": "7FC00000",
        "Infinity": "7F800000",
        "-Infinity": "FF800000",
        "+0": "00000000",
        "-0": "80000000",
      };

      // Determine the correct Hex
      const specialHex = specialHexMap[specialCase] || specialCase;
      setResultHex(specialHex);

      // Convert Hex to 32-bit Binary and group it into spaces
      const rawBin = hexToBinary(specialHex, 32);
      setResultBinary(rawBin);

      setStepTrace([
        {
          stepNumber: 1,
          title: "Special Case Detected",
          description: `Operation '${operation}' on operands produced special value '${specialCase}'`,
          type: "normalization",
          details: [
            { label: "Operand A", value: operandA },
            { label: "Operand B", value: operandB },
            { label: "Special Rule Result", value: specialCase, highlight: true },
          ],
        },
        {
          stepNumber: 2,
          title: "Final Special Result",
          description: "Special case value propagated to final output.",
          type: "final",
          intermediateResult: `${specialCase} | ${groupBits(rawBin)} | ${specialHex}`,
        },
      ]);
      return;
    }

    // --- HANDLE NORMAL NUMBERS ---
    // Fallback if parseFloat incorrectly handles "NaN" string
    if (Number.isNaN(valA) || Number.isNaN(valB)) {
      setResultDecimal("NaN");
      setResultHex("7FC00000");
      setResultBinary(hexToBinary("7FC00000", 32));
      return;
    }

    let finalVal = 0;
    if (operation === "subtraction") {
      finalVal = valA - valB;
    } else {
      // Math.fround forces 32-bit float precision for division to match IEEE-754
      finalVal = Math.fround(valA / valB);
    }

    const binA = decimalToBinary(valA);
    const binB = decimalToBinary(valB);
    const finalHex = decimalToHex(finalVal);
    const finalBin = hexToBinary(finalHex, 32);

    setResultDecimal(finalVal.toString());
    setResultBinary(finalBin);
    setResultHex(finalHex);

    setStepTrace([
      {
        stepNumber: 1,
        title: "Operand Normalization",
        description: "Parse operands and convert to binary normalized floating-point representation.",
        type: "normalization",
        details: [
          { label: "Operand A (Decimal)", value: operandA },
          { label: "Operand A (Binary)", value: groupBits(binA), isBinary: true },
          { label: "Operand B (Decimal)", value: operandB },
          { label: "Operand B (Binary)", value: groupBits(binB), isBinary: true },
        ],
      },
      {
        stepNumber: 2,
        title: operation === "subtraction" ? "Exponent Alignment" : "Exponent Adjustment",
        description:
          operation === "subtraction"
            ? "Shift significand of smaller operand to align exponents."
            : "Subtract biased exponents and add bias offset.",
        type: "alignment",
        details: [
          { label: "Operation Type", value: operation.toUpperCase(), highlight: true },
          // Updated label to make it clearer that 0 is an intentional match
          { label: "Exponent Diff", value: "0 (Exponents match)" },
        ],
      },
      {
        stepNumber: 3,
        title: operation === "subtraction" ? "Significand Subtraction" : "Significand Division",
        description:
          operation === "subtraction"
            ? "Perform binary significand subtraction."
            : "Perform restoring/non-restoring significand division.",
        type: "arithmetic",
        intermediateResult: groupBits(finalBin),
      },
      {
        stepNumber: 4,
        title: "Result Rounding & Formatting",
        description: "Apply IEEE-754 single precision rounding and assemble sign, exponent, and significand.",
        type: "rounding",
        details: [
          { label: "Decimal Result", value: finalVal.toString(), highlight: true },
          { label: "Hexadecimal (IEEE)", value: finalHex, isHex: true },
        ],
      },
      {
        stepNumber: 5,
        title: "Final Result Output",
        description: "Final formatted output in Decimal, Spaced Binary, and Hexadecimal.",
        type: "final",
        intermediateResult: `${finalVal} | ${groupBits(finalBin)} | ${finalHex}`,
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Module 3: Arithmetic Engine"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Arithmetic Configuration" className="md:col-span-1 space-y-4">
          <Input
            label="Operand A (Decimal or IEEE Hex)"
            value={operandA}
            onChange={(e) => setOperandA(e.target.value)}
            placeholder="e.g. 13.25"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Operation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOperation("subtraction")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  operation === "subtraction"
                    ? "bg-blue-600 border-blue-500 text-white shadow"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Subtract (-)
              </button>
              <button
                onClick={() => setOperation("division")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  operation === "division"
                    ? "bg-blue-600 border-blue-500 text-white shadow"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Divide (÷)
              </button>
            </div>
          </div>

          <Input
            label="Operand B (Decimal or IEEE Hex)"
            value={operandB}
            onChange={(e) => setOperandB(e.target.value)}
            placeholder="e.g. 5.5"
          />

          <Button onClick={handleCompute} className="w-full">
            Compute Step-by-Step
          </Button>
        </Card>

        <Card title="Final Results" className="md:col-span-2 space-y-3">
          {resultDecimal !== null ? (
            <div className="space-y-3">
              <OutputPanel label="Final Decimal" value={resultDecimal} badge="Decimal" highlight />
              <OutputPanel label="Final Binary" value={groupBits(resultBinary || "")} badge="Binary" />
              <OutputPanel label="Final Hexadecimal" value={resultHex} badge="IEEE Hex" />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Set operands and operation above, then click Compute Step-by-Step.
            </div>
          )}
        </Card>
      </div>

      {/* Step Trace */}
      {stepTrace.length > 0 && <StepViewer steps={stepTrace} title={`${operation.toUpperCase()} Calculation Trace`} />}
    </div>
  );
};

export default Arithmetic;