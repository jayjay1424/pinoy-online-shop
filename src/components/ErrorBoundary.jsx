import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Maison Likha Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060807] text-[#EDE8D0] flex flex-col items-center justify-center p-6 text-center font-serif">
          <div className="max-w-md p-8 rounded-2xl border border-[#D4AF37]/30 bg-stone-900/60 backdrop-blur-md shadow-2xl">
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2 font-mono">Likha Atelier • Safety Vault</p>
            <h1 className="text-2xl font-light mb-3">Spatial Experience Interrupted</h1>
            <p className="text-xs text-stone-400 font-sans mb-6">
              An unexpected display hitch occurred. Please reload to resume exploring the artisan collection.
            </p>
            <div className="flex gap-3 justify-center font-sans text-xs">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#D4AF37] text-stone-950 font-bold rounded-lg hover:bg-[#e6c258] transition-colors shadow-lg shadow-[#D4AF37]/20"
              >
                Reload Atelier
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch(e) {}
                  window.location.reload();
                }}
                className="px-4 py-2.5 border border-stone-700 text-stone-300 rounded-lg hover:bg-stone-800 transition-colors"
              >
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
