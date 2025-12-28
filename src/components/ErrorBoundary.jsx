import React from 'react';
import { AlertTriangle, RefreshCcw, Home, Terminal } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-old-lace p-6 relative overflow-hidden">
          {/* Background Ambience */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-200/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border border-white/60 relative z-10">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
              <AlertTriangle className="text-flag-red w-10 h-10" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 font-heading mb-2">System Error</h1>
            <p className="text-slate-500 mb-8 leading-relaxed font-medium">
              We encountered an unexpected issue. Our team has been notified. Please try reloading the page.
            </p>

            <div className="bg-slate-900 rounded-xl text-left mb-8 overflow-hidden shadow-lg border border-slate-800">
                <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                    <Terminal size={14} className="text-slate-400"/>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Error Log</span>
                </div>
                <div className="p-4 overflow-auto max-h-40 custom-scrollbar">
                    <code className="text-xs text-red-400 font-mono break-all leading-relaxed">
                        {this.state.error && this.state.error.toString()}
                    </code>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                onClick={this.handleReload}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition-all shadow-xl hover:shadow-flag-red/30 flex justify-center items-center gap-2 active:scale-95"
                >
                <RefreshCcw size={18} /> Reload Application
                </button>
                <button 
                onClick={this.handleHome}
                className="w-full py-4 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95"
                >
                <Home size={18} /> Return Home
                </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;