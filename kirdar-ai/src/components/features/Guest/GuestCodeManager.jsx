import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Loader, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Brain,
  Award,
  Clock,
  Activity
} from 'lucide-react';
import GuestCodeGeneration from '../Management/GuestCodeGeneration';

const FeatureTag = ({ label, enabled, icon: Icon }) => (
  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
    enabled 
      ? 'bg-sky-900/50 text-sky-400 border border-sky-800' 
      : 'bg-gray-800/50 text-gray-400 border border-gray-700'
  }`}>
    <Icon className="w-3 h-3" />
    {label}
  </span>
);

const GuestCodeManager = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/guest/codes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guest codes');
      }

      const data = await response.json();
      console.log('Fetched codes:', data);
      setCodes(data);
    } catch (err) {
      console.error('Error fetching codes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleDeactivateCode = async (codeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/guest/codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate code');
      }

      setSuccess('Code deactivated successfully');
      await fetchCodes();
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-sky-400 flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Guest Access Codes
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Generate and manage guest access codes
          </p>
        </div>
        <GuestCodeGeneration onCodeGenerated={fetchCodes} />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <p className="text-green-500">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="animate-spin h-8 w-8 text-sky-500" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No guest codes generated yet
        </div>
      ) : (
        <div className="space-y-4">
          {codes.map((code) => (
            <div
              key={code._id}
              className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono text-white">{code.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    code.status === 'active' 
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {code.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <FeatureTag 
                    label="Mentor" 
                    enabled={code.features?.mentorEnabled} 
                    icon={Brain}
                  />
                  <FeatureTag 
                    label="Evaluator" 
                    enabled={code.features?.evaluatorEnabled} 
                    icon={Award}
                  />
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {new Date(code.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Activity className="w-4 h-4" />
                    Uses: {code.usageCount || 0}
                  </div>
                </div>
              </div>
              
              {code.status === 'active' && (
                <button
                  onClick={() => handleDeactivateCode(code._id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-900/20"
                  title="Deactivate Code"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestCodeManager;