import { Component } from 'react';

// Error boundary — catches unhandled render errors and shows a fallback UI
// Uses a class component because React error boundaries require getDerivedStateFromError
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Capture the error in component state when a child throws
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Show fallback UI on error, or render children normally
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
