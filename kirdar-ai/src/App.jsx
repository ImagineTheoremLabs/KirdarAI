// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header/Header';
import AppRoutes from './routes';
import ApiService from './services/apiService';
import ErrorBoundary from './components/common/ErrorBoundary';
import ConnectionStatus from './components/common/ConnectionStatus';

function App() {
  useEffect(() => {
    // Initialize API service when the app starts
    ApiService.init().catch(error => {
      console.error('Failed to initialize API service:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-black">
            <Header />
            <main>
              <AppRoutes />
            </main>
            <ConnectionStatus />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;