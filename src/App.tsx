import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              C
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                Charitas IT System
              </span>
              <span className="text-xs text-slate-500 font-medium">Issue & FAQ Service Portal</span>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200">
            Milestone 0: Bootstrap
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Charitas IT Issue & FAQ Portal</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Project bootstrap is initialized. React, Vite, TypeScript, Tailwind CSS, and Vitest are operational.
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Ready for Milestone 1: Adapter Architecture</span>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Rumah Sakit Charitas — IT Team
      </footer>
    </div>
  );
};

export default App;
