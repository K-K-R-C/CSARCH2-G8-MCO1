import React from "react";

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = "",
  headerClassName = "",
}) => {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg p-5 transition-all duration-200 hover:border-slate-700/80 ${className}`}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between pb-4 mb-4 border-b border-slate-800 ${headerClassName}`}>
          <div>
            {title && typeof title === "string" ? (
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
