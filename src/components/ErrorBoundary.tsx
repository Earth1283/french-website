import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { FrenchFlag } from './ui/FrenchFlag';

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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <FrenchFlag size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary, #1a1f3a)' }}>
            Oh non, quelque chose a planté
          </h2>
          <p style={{ color: 'var(--text-secondary, #6b7280)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
            Something went wrong. The error has been logged.
          </p>
          <p style={{ color: 'var(--text-muted, #9aa0b2)', fontSize: '0.78rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
            {this.state.error.message}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '999px',
              backgroundColor: 'var(--accent, #E63946)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Réessayer — Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
