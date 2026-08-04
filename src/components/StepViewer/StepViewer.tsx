import React, { useState } from "react";
import Card from "../shared/Card";
import Button from "../shared/Button";

export interface StepItem {
  id?: string;
  stepNumber: number;
  title: string;
  description?: string;
  details?: {
    label: string;
    value: string;
    highlight?: boolean;
    isBinary?: boolean;
    isHex?: boolean;
  }[];
  intermediateResult?: string;
  type?: "normalization" | "alignment" | "arithmetic" | "rounding" | "final";
}

export interface StepViewerProps {
  title?: string;
  steps: StepItem[];
  currentStepIndex?: number;
  onStepChange?: (index: number) => void;
  className?: string;
}

export const StepViewer: React.FC<StepViewerProps> = ({
  title = "Calculation Trace",
  steps,
  className = "",
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [filterType, setFilterType] = useState<string>("all");

  const toggleExpand = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    steps.forEach((_, idx) => (all[idx] = true));
    setExpandedSteps(all);
  };

  const collapseAll = () => {
    setExpandedSteps({});
  };

  const filteredSteps = steps.filter((step) => {
    if (filterType === "all") return true;
    return step.type === filterType;
  });

  const getTypeBadgeClass = (type?: string) => {
    switch (type) {
      case "normalization":
        return "bg-purple-900/60 text-purple-300 border-purple-700/50";
      case "alignment":
        return "bg-amber-900/60 text-amber-300 border-amber-700/50";
      case "arithmetic":
        return "bg-blue-900/60 text-blue-300 border-blue-700/50";
      case "rounding":
        return "bg-emerald-900/60 text-emerald-300 border-emerald-700/50";
      case "final":
        return "bg-teal-900/60 text-teal-300 border-teal-700/50";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  if (!steps || steps.length === 0) {
    return (
      <Card className={className}>
        <div className="text-center py-8 text-slate-500 text-sm">
          No calculation steps generated yet. Enter inputs and run operation to view step trace.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-100">{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {steps.length} Steps
          </span>
        </div>
      }
      action={
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      }
      className={className}
    >
      {/* Category filter */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-3 mb-4 border-b border-slate-800 text-xs">
        {["all", "normalization", "alignment", "arithmetic", "rounding", "final"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors whitespace-nowrap ${
              filterType === type
                ? "bg-blue-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Steps List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filteredSteps.map((step, idx) => {
          const isExpanded = expandedSteps[idx] !== false; // default expanded
          return (
            <div
              key={step.id || idx}
              className={`border rounded-xl transition-colors ${
                step.type === "final"
                  ? "border-teal-500/40 bg-teal-950/10"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              }`}
            >
              {/* Step Header */}
              <div
                onClick={() => toggleExpand(idx)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center border border-slate-700">
                    {step.stepNumber}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                      <span>{step.title}</span>
                      {step.type && (
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${getTypeBadgeClass(
                            step.type
                          )}`}
                        >
                          {step.type}
                        </span>
                      )}
                    </h4>
                    {step.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-200 p-1">
                  <svg
                    className={`w-4 h-4 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Step Details Body */}
              {isExpanded && (step.details || step.intermediateResult) && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/80 space-y-2">
                  {step.details && step.details.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {step.details.map((detail, dIdx) => (
                        <div
                          key={dIdx}
                          className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 space-y-1"
                        >
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                            {detail.label}
                          </span>
                          <span
                            className={`font-mono block break-all ${
                              detail.highlight ? "text-blue-400 font-semibold" : "text-slate-200"
                            }`}
                          >
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.intermediateResult && (
                    <div className="mt-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-400 block mb-1">
                        Intermediate Result
                      </span>
                      <span className="text-teal-200 font-bold break-all">{step.intermediateResult}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default StepViewer;
