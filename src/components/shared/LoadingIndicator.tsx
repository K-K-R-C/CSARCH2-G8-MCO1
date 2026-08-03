import React from "react";

export interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Processing calculation...",
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-3 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
      {message && <p className="text-sm font-medium text-slate-400">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
