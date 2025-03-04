import { useState, useEffect } from 'react';
import { WifiOff, Server, RefreshCw, Clock, AlertTriangle, CheckCircle, Globe, Wifi } from 'lucide-react';
import ApiService from '../../services/apiService';
import { API_BASE_URL } from '../../config/config';

const ServerStatus = () => {
  const [isConnected, setIsConnected] = useState(ApiService.isApiConnected);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [endpointStatus, setEndpointStatus] = useState({});
  const [pingResults, setPingResults] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    type: null,
    downlink: null
  });
  const [activeBaseUrl, setActiveBaseUrl] = useState(ApiService.activeBaseUrl);

  useEffect(() => {
    // Listen for API connection change events
    const handleConnectionChange = (event) => {
      setIsConnected(event.detail.connected);
      if (event.detail.baseUrl) {
        setActiveBaseUrl(event.detail.baseUrl);
      }
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, online: true }));
    };
    
    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, online: false }));
    };
    
    // Check network connection type if available
    if ('connection' in navigator) {
      setNetworkStatus({
        online: navigator.onLine,
        type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink
      });
      
      // Listen for connection changes
      navigator.connection.addEventListener('change', () => {
        setNetworkStatus({
          online: navigator.onLine,
          type: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink
        });
      });
    }

    window.addEventListener('api-connection-change', handleConnectionChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check status on mount
    checkServerStatus();
    
    return () => {
      window.removeEventListener('api-connection-change', handleConnectionChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', () => {});
      }
    };
  }, []);

  const checkServerStatus = async () => {
    setIsChecking(true);
    setLastChecked(new Date());
    
    const results = {};
    
    // Try each health endpoint
    for (const endpoint of ApiService.healthEndpoints) {
      try {
        const startTime = performance.now();
        const url = `${ApiService.activeBaseUrl}${endpoint}`;
        
        results[endpoint] = { 
          url,
          status: 'checking',
          latency: null,
          error: null
        };
        setEndpointStatus({...results});
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        results[endpoint] = {
          url,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          latency,
          error: null
        };
      } catch (error) {
        results[endpoint] = {
          url: `${ApiService.activeBaseUrl}${endpoint}`,
          status: 'error',
          latency: null,
          error: error.message
        };
      }
      
      setEndpointStatus({...results});
    }
    
    // Check ping to the server domain
    try {
      const domain = new URL(ApiService.activeBaseUrl).hostname;
      const pingStart = performance.now();
      
      try {
        // Simple ping using a favicon request (lightweight)
        await fetch(`https://${domain}/favicon.ico`, { 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        const pingEnd = performance.now();
        setPingResults({
          domain,
          status: 'success',
          latency: Math.round(pingEnd - pingStart),
          error: null
        });
      } catch (error) {
        setPingResults({
          domain,
          status: 'error',
          latency: null,
          error: error.message
        });
      }
    } catch (error) {
      console.error('Error pinging server:', error);
    }
    
    setIsChecking(false);
    
    // Update API service connection status
    ApiService.isApiConnected = Object.values(results).some(r => r.status === 'success');
    
    // Emit connection change event
    window.dispatchEvent(new CustomEvent('api-connection-change', { 
      detail: { connected: ApiService.isApiConnected } 
    }));
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const getNetworkTypeLabel = (type) => {
    if (!type) return 'Unknown';
    
    switch (type) {
      case 'slow-2g':
        return 'Slow 2G (Very Poor)';
      case '2g':
        return '2G (Poor)';
      case '3g':
        return '3G (Fair)';
      case '4g':
        return '4G (Good)';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            Server Status
          </h2>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm mr-2">
              Last checked: {formatTime(lastChecked)}
            </span>
            <button
              onClick={checkServerStatus}
              disabled={isChecking}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Check Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-xl font-semibold text-white">Network Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                {networkStatus.online ? (
                  <Wifi className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 mr-2 text-red-500" />
                )}
                <h4 className="font-semibold text-white">Internet Connection</h4>
              </div>
              <p className={`text-sm ${networkStatus.online ? 'text-green-400' : 'text-red-400'}`}>
                {networkStatus.online ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            
            {networkStatus.type && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Server className="h-5 w-5 mr-2 text-blue-500" />
                  <h4 className="font-semibold text-white">Connection Type</h4>
                </div>
                <p className="text-sm text-gray-300">
                  {getNetworkTypeLabel(networkStatus.type)}
                  {networkStatus.downlink && ` (${networkStatus.downlink} Mbps)`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* API Connection Status */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            {isConnected ? (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-semibold">API Connected</h3>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <WifiOff className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-semibold">API Disconnected</h3>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-gray-300 mb-2">Active API Base URL:</p>
            <code className="block bg-gray-800 p-2 rounded text-green-400 font-mono text-sm overflow-x-auto">
              {activeBaseUrl}
            </code>
          </div>
          
          {pingResults && (
            <div className="mb-4">
              <p className="text-gray-300 mb-2">Server Ping:</p>
              <div className={`flex items-center p-2 rounded ${
                pingResults.status === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
              }`}>
                <span className="font-mono mr-2">{pingResults.domain}</span>
                {pingResults.status === 'success' ? (
                  <span className="text-sm">{pingResults.latency}ms</span>
                ) : (
                  <span className="text-sm">{pingResults.error}</span>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-gray-300 mb-2">Alternative Base URLs:</p>
            <div className="space-y-2">
              {ApiService.alternativeBaseUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                  <code className="font-mono text-xs text-blue-400">{url}</code>
                  <button
                    onClick={() => {
                      ApiService.activeBaseUrl = url;
                      setActiveBaseUrl(url);
                      checkServerStatus();
                    }}
                    className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-2 py-1 rounded"
                  >
                    Try This URL
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Endpoints */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Health Endpoints
          </h3>
          
          <div className="space-y-4">
            {Object.entries(endpointStatus).map(([endpoint, status]) => (
              <div key={endpoint} className="border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="font-mono text-blue-400">{endpoint}</code>
                  {status.status === 'success' ? (
                    <span className="px-2 py-1 bg-green-900/20 text-green-400 text-xs rounded-full">
                      {status.statusCode} OK
                    </span>
                  ) : status.status === 'checking' ? (
                    <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 text-xs rounded-full flex items-center">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Checking
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-900/20 text-red-400 text-xs rounded-full">
                      Failed
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-400">
                  <p className="mb-1">URL: <code className="text-gray-300">{status.url}</code></p>
                  {status.latency && (
                    <p className="mb-1">Latency: <span className="text-gray-300">{status.latency}ms</span></p>
                  )}
                  {status.error && (
                    <p className="text-red-400">{status.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Troubleshooting
          </h3>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-1">Connection Refused</h4>
              <p>If you see "ERR_CONNECTION_REFUSED" errors:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Check if the API server is running on the specified host and port</li>
                <li>Verify that port 5001 is open in the server's firewall</li>
                <li>Ensure the EC2 instance is running and its security group allows inbound traffic on port 5001</li>
                <li>Check if the server application is listening on the correct port</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-1">CORS Issues</h4>
              <p>If you see CORS-related errors:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Ensure the API server has CORS configured to allow requests from your frontend origin</li>
                <li>Check that the API server includes the necessary CORS headers in its responses</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-1">Server Configuration</h4>
              <p>Server configuration details:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Active API Base URL: <code className="bg-gray-800 px-1 rounded">{activeBaseUrl}</code></li>
                <li>Server: EC2 instance at <code className="bg-gray-800 px-1 rounded">ec2-18-232-67-55.compute-1.amazonaws.com</code></li>
                <li>Port: 5001</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerStatus; 