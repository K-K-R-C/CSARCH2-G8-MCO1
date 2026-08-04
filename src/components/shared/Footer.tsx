import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-500 text-xs py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-medium text-slate-400">CSARCH2 Simulation Project — Machine 4</p>
          <p className="mt-0.5">Decimal 32-bit Floating-Point Machine (IEEE 754)</p>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[11px]">
          <span>React 19</span>
          <span>•</span>
          <span>Vite 8</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Group 8</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
