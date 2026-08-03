import React from "react";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  badge,
  className = "",
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center space-x-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">{title}</h2>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {badge}
          </span>
        )}
      </div>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
  );
};

export default SectionHeader;
