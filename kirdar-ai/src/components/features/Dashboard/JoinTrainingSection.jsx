// src/components/features/Dashboard/JoinTrainingSection.jsx
import React, { useState } from 'react';
import { ArrowRight, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';

const JoinTrainingSection = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/trainee/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join training program');
      }

      setSuccess('Successfully joined training program!');
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-sky-400 mb-4">Join Training Program</h2>
      <p className="text-gray-400 mb-6">
        Enter your training code below to join a program. You'll get access to personalized scenarios and guidance from your assigned advisor.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="text-green-500">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
            Training Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter your training code"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={!code || loading}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:from-sky-500 hover:to-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : (
            <>
              Join Program
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default JoinTrainingSection;