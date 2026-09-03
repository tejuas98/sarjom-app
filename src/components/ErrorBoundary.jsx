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
    console.error('SARJOM UI Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '32px',
          margin: '24px auto',
          maxWidth: '600px',
          backgroundColor: '#FFF1F2',
          border: '3px solid #E11D48',
          borderRadius: '16px',
          boxShadow: '4px 4px 0 #E11D48',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ color: '#9F1239', marginBottom: '12px', fontSize: '1.4rem' }}>
            ⚠️ घटक रेंडरिंग सूचना (Component Notice)
          </h2>
          <p style={{ color: '#4C0519', marginBottom: '16px', fontSize: '0.95rem' }}>
            {this.state.error?.message || 'घटक लोड करने में एक अस्थायी त्रुटि आई।'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔄 पुनः लोड करें (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
