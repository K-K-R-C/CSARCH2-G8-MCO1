import React from "react";

export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className = "" }) => {
  if (!label) {
    return <hr className={`border-slate-800 my-6 ${className}`} />;
  }

  return (
    <div className={`relative my-6 flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-800" />
      </div>
      <div className="relative bg-slate-900 px-3 text-xs uppercase tracking-wider font-semibold text-slate-500">
        {label}
      </div>
    </div>
  );
};

export default Divider;
