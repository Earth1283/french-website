import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { OH_NON } from './ui/Feedback';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="page page--narrow">
          <p className="ohnon__cry" lang="fr">{OH_NON}</p>
          <h2 className="h-section mt-2">This screen stopped working.</h2>
          <p className="t-body mt-2">Try again. If it keeps happening, reload the app.</p>
          <p className="t-small mt-4">{this.state.error.message}</p>
          <Button variant="primary" className="mt-6" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
