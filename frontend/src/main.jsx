import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected runtime error' }
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#0f172a', padding: '24px' }}>
          <div style={{ maxWidth: '680px', width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Application Error</h1>
            <p style={{ marginTop: '10px', color: '#475569' }}>The page failed to render. Refresh once, and if this persists share this message:</p>
            <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', background: '#f1f5f9', borderRadius: '8px', padding: '12px', color: '#334155' }}>
              {this.state.message}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
