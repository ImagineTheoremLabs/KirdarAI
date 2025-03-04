import { Component } from 'react';
import { AlertCircle, RefreshCw, WifiOff, Server, ExternalLink } from 'lucide-react';
import ApiService from '../../services/apiService';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      isApiConnected: ApiService.isApiConnected,
      isRetrying: false,
      retryCount: 0
    };
  }

  componentDidMount() {
    // Listen for API connection change events
    window.addEventListener('api-connection-change', this.handleConnectionChange);
  }

  componentWillUnmount() {
    // Clean up event listener
    window.removeEventListener('api-connection-change', this.handleConnectionChange);
  }

  handleConnectionChange = (event) => {
    this.setState({ 
      isApiConnected: event.detail.connected,
      // If we're reconnected and the error was a connection error, clear the error
      hasError: event.detail.connected && this.state.error?.isConnectionError 
        ? false 
        : this.state.hasError,
      error: event.detail.connected && this.state.error?.isConnectionError 
        ? null 
        : this.state.error
    });
  };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      isApiConnected: error.isConnectionError ? false : ApiService.isApiConnected
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Check if it's an API connectivity issue
    if (error.message && (
      error.message.includes('connect to the server') || 
      error.message.includes('Failed to fetch') ||
      error.isConnectionError
    )) {
      this.setState({ isApiConnected: false });
    }
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // Check API connectivity
      const isConnected = await ApiService.checkApiConnectivity();
      
      if (isConnected) {
        // Reset the error state if API is connected
        this.setState({ 
          hasError: false, 
          error: null, 
          errorInfo: null,
          isApiConnected: true,
          retryCount: 0
        });
      } else {
        // Update state to show API is still disconnected
        this.setState({ 
          isApiConnected: false,
          retryCount: this.state.retryCount + 1
        });
      }
    } catch (error) {
      console.error('Error checking API connectivity:', error);
      this.setState({ 
        isApiConnected: false,
        retryCount: this.state.retryCount + 1
      });
    } finally {
      this.setState({ isRetrying: false });
    }
  };

  navigateToServerStatus = () => {
    window.location.href = '/server-status';
  };

  render() {
    const { hasError, error, isApiConnected, isRetrying, retryCount } = this.state;
    
    if (hasError) {
      // API connectivity error
      if (!isApiConnected || error?.isConnectionError) {
        return (
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
              <WifiOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
              <p className="text-gray-300 mb-6">
                {retryCount > 2 
                  ? "We're having trouble connecting to the server. The server might be down or undergoing maintenance."
                  : "Unable to connect to the server. Please check your internet connection and try again."}
              </p>
              <div className="flex flex-col items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={this.handleRetry}
                    disabled={isRetrying}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Retry Connection
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={this.navigateToServerStatus}
                    className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Server Diagnostics
                  </button>
                </div>
                
                {retryCount > 1 && (
                  <div className="mt-4 text-sm text-gray-400">
                    <p>If the problem persists, you can:</p>
                    <ul className="mt-2 list-disc text-left pl-8">
                      <li>Check if the server is running</li>
                      <li>Verify your network connection</li>
                      <li>Contact the administrator</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      
      // Server error (5xx)
      if (error?.status >= 500) {
        return (
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
              <Server className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Server Error</h2>
              <p className="text-gray-300 mb-6">
                The server encountered an error while processing your request. This is not your fault.
                {error?.status && ` (Error ${error.status})`}
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh Page
                </button>
                
                <button
                  onClick={this.navigateToServerStatus}
                  className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Server Status
                </button>
              </div>
            </div>
          </div>
        );
      }
      
      // Generic error fallback
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              {error?.message || "We're sorry, but an error occurred. Please try refreshing the page."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 