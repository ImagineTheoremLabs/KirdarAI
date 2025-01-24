// src/components/features/Guest/GuestSelection.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  ArrowRight,
  Users,
  Target,
  Clock,
  BookOpen,
  AlertCircle,
  // Add any other icons you need
} from 'lucide-react';

// GuestSelection Component
const GuestSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code, assignments, features } = location.state || {};

  useEffect(() => {
    if (!code || !assignments) {
      navigate('/guest', { replace: true });
    }
  }, [code, assignments, features, navigate]);

  const handleStartSimulation = (type, data) => {
    navigate('/guest/simulation', {
      state: {
        type,
        data,
        guestData: {
          code,
          assignments,
          features: {
            mentorEnabled: features?.mentorEnabled || false,
            evaluatorEnabled: features?.evaluatorEnabled || false
          }
        }
      }
    });
  };

  if (!code || !assignments) {
    return null;
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Expert':
        return 'bg-red-900/50 text-red-400 border border-red-900/50';
      case 'Advanced':
        return 'bg-orange-900/50 text-orange-400 border border-orange-900/50';
      default:
        return 'bg-yellow-900/50 text-yellow-400 border border-yellow-900/50';
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1),rgba(4,6,12,1))]" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20 mb-6">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span className="text-sky-400 font-medium">Guest Access Code: {code}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-6">
              Choose Your Simulation
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select a client persona or scenario to begin your advisory training session.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personas Section */}
            {assignments.personas && assignments.personas.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-sky-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Client Personas</h2>
                    <p className="text-gray-400">Practice with different client profiles</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {assignments.personas.map((persona) => (
                    <button
                      key={persona._id}
                      onClick={() => handleStartSimulation('persona', persona)}
                      className="w-full bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-sky-900/50 hover:bg-gray-900/80 text-left transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-sky-400 group-hover:text-sky-300">
                          {persona.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-sm bg-sky-900/30 text-sky-400 border border-sky-800">
                          Age: {persona.age}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-gray-400 mt-1" />
                          <p className="text-gray-300">{persona.goals}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400 mt-1" />
                          <p className="text-gray-400">{persona.concerns}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300">
                          {persona.riskTolerance} Risk
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300">
                          {persona.knowledgeLevel} Knowledge
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scenarios Section */}
            {assignments.scenarios && assignments.scenarios.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-sky-900/20 rounded-lg">
                    <Target className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Practice Scenarios</h2>
                    <p className="text-gray-400">Complete advisory challenges</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {assignments.scenarios.map((scenario) => (
                    <button
                      key={scenario._id}
                      onClick={() => handleStartSimulation('scenario', scenario)}
                      className="w-full bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-sky-900/50 hover:bg-gray-900/80 text-left transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-sky-400 group-hover:text-sky-300 mb-2">
                          {scenario.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                      </div>

                      <p className="text-gray-300 mb-4">
                        {scenario.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                          {scenario.category}
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                          <Clock className="w-4 h-4" />
                          {scenario.estimatedTime}
                        </span>
                        {scenario.objectives?.length > 0 && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                            <Target className="w-4 h-4" />
                            {scenario.objectives.length} Objectives
                          </span>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 bg-sky-500/10 text-sky-400 p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {(!assignments.personas?.length && !assignments.scenarios?.length) && (
            <div className="max-w-2xl mx-auto text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
              <div className="p-4 bg-gray-800/50 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Content Available</h3>
              <p className="text-gray-400">
                No content has been assigned to this guest code. Please contact the administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestSelection;