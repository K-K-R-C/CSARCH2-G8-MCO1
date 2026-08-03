import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import Home from "./pages/Home";
import Converter from "./pages/Converter";
import Rounding from "./pages/Rounding";
import Arithmetic from "./pages/Arithmetic";

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/converter" element={<Converter />} />
              <Route path="/rounding" element={<Rounding />} />
              <Route path="/arithmetic" element={<Arithmetic />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;