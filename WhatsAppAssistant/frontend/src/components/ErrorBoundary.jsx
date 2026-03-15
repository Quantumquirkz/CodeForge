import { Component } from "react";

/**
 * Error Boundary to catch React render errors and show a fallback UI.
 * Wrap the app (or a subtree) to prevent the whole app from unmounting on errors.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-200 p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-xl font-semibold text-amber-400">Algo salió mal</h1>
            <p className="text-sm text-slate-400">
              {this.state.error?.message ?? "Error desconocido"}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
