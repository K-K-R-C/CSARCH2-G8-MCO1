import React from "react";
import { NavLink } from "react-router-dom";

export const Navbar: React.FC = () => {
  const navItems = [
    { path: "/", label: "Overview", icon: "🏠" },
    { path: "/converter", label: "Converter", icon: "🔢" },
    { path: "/rounding", label: "Rounding", icon: "⚖️" },
    { path: "/arithmetic", label: "Arithmetic", icon: "🧮" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            M4
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
              IEEE-754 Decimal32
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">CSARCH2 Group 8 • Machine 4</p>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
