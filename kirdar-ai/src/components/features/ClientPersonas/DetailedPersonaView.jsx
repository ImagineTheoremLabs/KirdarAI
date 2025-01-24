// src/components/features/ClientPersonas/DetailedPersonaView.jsx
import {
    DollarSign,
    Target,
    AlertCircle,
    BookOpen,
    Calendar,
    Briefcase,
    TrendingUp,
    Shield
  } from 'lucide-react';
  
  const DetailedPersonaView = ({ persona }) => {
    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <div>
              <p className="text-gray-400 text-sm">Age</p>
              <p className="text-white">{persona.age}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sky-400" />
            <div>
              <p className="text-gray-400 text-sm">Income</p>
              <p className="text-white">{persona.income}</p>
            </div>
          </div>
        </div>
  
        {/* Portfolio */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-white">Portfolio</h3>
          </div>
          <p className="text-gray-300 ml-7">{persona.portfolio}</p>
        </div>
  
        {/* Goals */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-white">Goals</h3>
          </div>
          <p className="text-gray-300 ml-7">{persona.goals}</p>
        </div>
  
        {/* Concerns */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-white">Concerns</h3>
          </div>
          <p className="text-gray-300 ml-7">{persona.concerns}</p>
        </div>
  
        {/* Risk Tolerance */}
        {persona.riskTolerance && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-semibold text-white">Risk Tolerance</h3>
            </div>
            <p className="text-gray-300 ml-7">{persona.riskTolerance}</p>
          </div>
        )}
  
        {/* Knowledge Level */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-white">Knowledge Level</h3>
          </div>
          <p className="text-gray-300 ml-7">{persona.knowledgeLevel}</p>
        </div>
  
        {/* Investment Preferences */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-white">Suggested Approach</h3>
          </div>
          <ul className="space-y-2 text-gray-300 ml-7">
            <li>• Focus on understanding client's risk tolerance and goals</li>
            <li>• Explain investment concepts in clear, simple terms</li>
            <li>• Provide comprehensive portfolio diversification strategy</li>
            <li>• Address specific concerns about market volatility</li>
          </ul>
        </div>
      </div>
    );
  };
  
  export default DetailedPersonaView;