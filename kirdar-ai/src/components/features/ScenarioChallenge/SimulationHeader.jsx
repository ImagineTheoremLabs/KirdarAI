// src/components/features/ScenarioChallenge/SimulationHeader.jsx
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ArrowLeft, 
  Clock, 
  Target, 
  User, 
  ToggleLeft, 
  ToggleRight,
  Brain,
  MessageSquare,
  AlertTriangle,
  X,
  Check,
  Activity,
  Users
} from 'lucide-react';

const SimulationHeader = ({ 
  scenarioData, 
  onEndChat, 
  onBackClick,
  startTime = new Date(),
  isMentorEnabled,
  onMentorToggle,
  showMentorToggle = true,
  isGuest = false
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEndWarning, setShowEndWarning] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle end session confirmation
  const handleEndClick = () => {
    if (!showEndWarning) {
      setShowEndWarning(true);
      setTimeout(() => setShowEndWarning(false), 3000);
      return;
    }
    onEndChat();
    setShowEndWarning(false);
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Expert':
        return 'bg-red-900/50 text-red-400';
      case 'Advanced':
        return 'bg-orange-900/50 text-orange-400';
      default:
        return 'bg-yellow-900/50 text-yellow-400';
    }
  };

  return (
    <>
      <div className="fixed top-16 left-0 right-0 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Main Header Row */}
          <div className="flex items-center justify-between">
            {/* Left Section - Back Button and Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBackClick}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  {scenarioData.type === 'persona' ? (
                    <>
                      <Users className="w-5 h-5 text-sky-400" />
                      {scenarioData.name}
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 text-sky-400" />
                      {scenarioData.title}
                    </>
                  )}
                </h2>
                <div className="text-sm text-gray-400">
                  {scenarioData.type === 'persona' ? (
                    'Client Simulation'
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{scenarioData.category}</span>
                      <span className="text-gray-600">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        getDifficultyColor(scenarioData.difficulty)
                      }`}>
                        {scenarioData.difficulty}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center gap-4">
              {/* Mentor Toggle */}
              {showMentorToggle && (
                <button
                  onClick={onMentorToggle}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    isMentorEnabled 
                      ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                  title={isMentorEnabled ? 'Disable mentor' : 'Enable mentor'}
                >
                  <Brain className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">
                    {isMentorEnabled ? 'Mentor Active' : 'Enable Mentor'}
                  </span>
                  {isMentorEnabled ? (
                    <ToggleRight className="w-5 h-5 ml-1" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 ml-1" />
                  )}
                </button>
              )}

              {/* Session Timer */}
              <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="text-gray-300 font-medium">{formatTime(elapsedTime)}</span>
              </div>

              {/* End Session Button */}
              <button
                onClick={handleEndClick}
                className={`bg-gradient-to-r ${
                  showEndWarning 
                    ? 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600' 
                    : 'from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500'
                } text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 
                shadow-lg hover:shadow-sky-500/25 flex items-center gap-2 group`}
              >
                {showEndWarning ? (
                  <>
                    <AlertTriangle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="hidden sm:inline">Click again to confirm</span>
                    <span className="sm:hidden">Confirm</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="hidden sm:inline">End Session & Evaluate</span>
                    <span className="sm:hidden">End</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Spacer to prevent content from being hidden under the header */}
      <div className="h-16" />
    </>
  );
};

export default SimulationHeader;