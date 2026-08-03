import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isMonospace?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  isMonospace = true,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-slate-950 border ${
          error ? "border-red-500 focus:ring-red-500" : "border-slate-800 focus:border-blue-500 focus:ring-blue-500"
        } rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 text-sm ${
          isMonospace ? "font-mono" : ""
        } transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
};

export default Input;
