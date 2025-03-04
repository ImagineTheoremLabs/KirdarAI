import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ApiService from '../../services/apiService';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(ApiService.isApiConnected);
  const [showStatus, setShowStatus] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check connection status initially and on mount
    checkConnection();

    // Listen for API connection change events
    const handleConnectionChange = (event) => {
      setIsConnected(event.detail.connected);
      setShowStatus(!event.detail.connected || showStatus);
    };

    window.addEventListener('api-connection-change', handleConnectionChange);

    // Set up interval to check connection status
    const intervalId = setInterval(checkConnection, 60000); // Check every minute

    // Clean up interval and event listener on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('api-connection-change', handleConnectionChange);
    };
  }, [showStatus]);

  const checkConnection = async () => {
    try {
      const connected = await ApiService.checkApiConnectivity();
      setIsConnected(connected);
      
      // Show status indicator if disconnected
      if (!connected) {
        setShowStatus(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
      setShowStatus(true);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      await ApiService.checkApiConnectivity();
      // Status will be updated via the event listener
    } catch (error) {
      console.error('Error retrying connection:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Hide the status after 5 seconds if connected
  useEffect(() => {
    if (isConnected && showStatus) {
      const timerId = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
      
      return () => clearTimeout(timerId);
    }
  }, [isConnected, showStatus]);

  // Don't render anything if connected and not showing status
  if (isConnected && !showStatus) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
        isConnected 
          ? 'bg-green-500/20 text-green-500 border border-green-500/50' 
          : 'bg-red-500/20 text-red-500 border border-red-500/50'
      }`}
    >
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Connected</span>
        </>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center">
            <WifiOff className="h-4 w-4 mr-2" />
            <span>API Disconnected</span>
          </div>
          <div className="flex items-center mt-2 space-x-2">
            <button 
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="flex items-center justify-center text-xs bg-red-500/30 hover:bg-red-500/50 rounded px-2 py-1 transition-colors"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </>
              )}
            </button>
            <Link
              to="/server-status"
              className="flex items-center justify-center text-xs bg-blue-500/30 hover:bg-blue-500/50 rounded px-2 py-1 transition-colors"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Diagnostics
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus; 