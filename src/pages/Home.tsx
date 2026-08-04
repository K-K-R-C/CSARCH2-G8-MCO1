import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/shared/Card";
import SectionHeader from "../components/shared/SectionHeader";

export const Home: React.FC = () => {
  const modules = [
    {
      title: "Module 1: Converter Engine",
      path: "/converter",
      color: "from-blue-600/20 to-cyan-600/10 border-blue-500/30 text-blue-400",
      description:
        "Converts decimal numbers into IEEE-754 decimal 32-bit single-precision binary and hexadecimal representations with special case detection.",
      features: [
        "Decimal parsing & sign extraction",
        "Exponent and coefficient extraction",
        "Binary & Hexadecimal output",
        "Decode-back verification",
      ],
    },
    {
      title: "Module 2: Rounding Engine",
      path: "/rounding",
      color: "from-purple-600/20 to-pink-600/10 border-purple-500/30 text-purple-400",
      description:
        "Demonstrates four IEEE-754 rounding algorithms on decimal or binary inputs for any target bit/digit count.",
      features: [
        "Chopping (Truncation)",
        "Round-Up (+Infinity)",
        "Round-Down (-Infinity)",
        "Round-to-Nearest Ties-to-Even",
      ],
    },
    {
      title: "Module 3: Arithmetic Engine",
      path: "/arithmetic",
      color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400",
      description:
        "Executes Subtraction and Division on IEEE-754 single-precision operands with full step-by-step trace generation.",
      features: [
        "Operand normalization & alignment",
        "Significand subtraction & division",
        "Division-by-zero handling",
        "Step-by-step trace visualization",
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <span>CSARCH2 Group 8</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Decimal 32-bit Floating-Point Machine
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            An interactive simulator for IEEE-754 decimal single-precision conversions, rounding modes, and step-by-step subtraction & division arithmetic.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 justify-center">
            <Link
              to="/converter"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-900/40"
            >
              Launch Converter →
            </Link>
            <Link
              to="/arithmetic"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
            >
              Arithmetic Operations
            </Link>
          </div>
        </div>
      </div>

      {/* Modules Overview */}
      <div>
        <SectionHeader
          title="Machine Modules & Feature Breakdown"
          description="Select a module below to inspect or run calculations."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Card key={mod.path} className={`flex flex-col justify-between border bg-slate-900/60 ${mod.color}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{mod.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{mod.description}</p>
                <ul className="space-y-1.5 mb-6 text-xs text-slate-300">
                  {mod.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center space-x-2">
                      <span className="text-blue-400">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to={mod.path}
                className="w-full text-center py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors block"
              >
                Open Module →
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Machine 4 Specifications Card */}
      <Card
        title="Machine 4 Specification Reference"
        subtitle="IEEE 754 Decimal Single-Precision Operations"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-blue-400 text-sm block">1. Conversion</span>
            <p className="text-slate-400">
              Converts decimal number into IEEE 754 decimal single-precision string in formatted binary & 8-digit hex, supporting NaN, ±Infinity, ±0, Overflow, Underflow.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-purple-400 text-sm block">2. Rounding Modes</span>
            <p className="text-slate-400">
              Demonstrates 4 mandatory rounding methods: Chopping (truncation), Round-up, Round-down, and Round-to-nearest ties-to-even.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 text-sm block">3. Arithmetic</span>
            <p className="text-slate-400">
              Calculates Subtraction and Division with step-by-step solution trace, exponent alignment, significand operations, and final Decimal, Binary, and Hex outputs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;
