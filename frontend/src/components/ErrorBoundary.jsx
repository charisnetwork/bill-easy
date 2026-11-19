import React from 'react';

// Keeps one broken page from blanking the whole app: shows a way out instead of a white screen.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  componentDidUpdate(previous) {
    // Moving to another page clears the error.
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold text-slate-900">This page ran into a problem</h1>
          <p className="text-sm text-slate-600">Your data is safe. Reload the page, or go back to the dashboard. If it keeps happening, contact support.</p>
          <div className="flex justify-center gap-3 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm" onClick={() => window.location.reload()}>Reload</button>
            <a href="/dashboard" className="px-4 py-2 rounded-lg border text-sm">Dashboard</a>
          </div>
        </div>
      </div>
    );
  }
}
