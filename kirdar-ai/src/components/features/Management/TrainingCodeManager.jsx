// src/components/features/Management/TrainingCodeManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Users, CheckCircle2, XCircle, Loader } from 'lucide-react';

const TrainingCodeManager = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/admin/codes', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch codes');
      }

      const data = await response.json();
      setCodes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const generateCode = async () => {
    try {
      setGenerating(true);
      const response = await fetch('http://localhost:5001/api/admin/codes/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          expiresIn: 7,
          maxUses: 1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate code');
      }

      await fetchCodes();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const deactivateCode = async (codeId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate code');
      }

      await fetchCodes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-sky-400">Training Codes</h2>
        <button
          onClick={generateCode}
          disabled={generating}
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <Loader className="animate-spin h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Generate Code
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="animate-spin h-8 w-8 text-sky-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {codes.map((code) => (
            <div
              key={code._id}
              className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-mono text-white">{code.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    code.status === 'active' 
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {code.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Expires: {new Date(code.expiresAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Uses: {code.timesUsed}/{code.maxUses}
                  </span>
                </div>
              </div>
              {code.status === 'active' && (
                <button
                  onClick={() => deactivateCode(code._id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Deactivate Code"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}

          {codes.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No training codes generated yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainingCodeManager;