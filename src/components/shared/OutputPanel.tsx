import React, { useState } from "react";

export interface OutputPanelProps {
  label: string;
  value: string | number | null | undefined;
  copyable?: boolean;
  highlight?: boolean;
  badge?: string;
  className?: string;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  label,
  value,
  copyable = true,
  highlight = false,
  badge,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const displayVal = value !== null && value !== undefined ? String(value) : "—";

  const handleCopy = () => {
    if (displayVal !== "—") {
      navigator.clipboard.writeText(displayVal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`relative bg-slate-950/80 border ${
        highlight ? "border-blue-500/50 bg-blue-950/20" : "border-slate-800"
      } rounded-xl p-3.5 flex flex-col justify-between transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div className="flex items-center space-x-2">
          {badge && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {badge}
            </span>
          )}
          {copyable && displayVal !== "—" && (
            <button
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800"
              title="Copy to clipboard"
            >
              {copied ? (
                <span className="text-emerald-400 text-[11px] font-sans font-medium">Copied!</span>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="font-mono text-sm sm:text-base text-slate-100 break-all select-all font-medium">
        {displayVal}
      </div>
    </div>
  );
};

export default OutputPanel;
