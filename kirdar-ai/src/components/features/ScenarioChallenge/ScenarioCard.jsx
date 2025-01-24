import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Clock, 
  ArrowRight,
  BookOpen 
} from 'lucide-react';

const ScenarioCard = ({ scenario }) => {
  const navigate = useNavigate();

  const handleStartChallenge = () => {
    navigate('/simulation', {
      state: {
        type: 'scenario',
        data: scenario
      }
    });
  };

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

  if (!scenario) return null;

  return (
    <div 
      className="bg-gray-900/50 rounded-xl border border-gray-800 hover:border-sky-900/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
      onClick={handleStartChallenge}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <Target className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-xl font-semibold text-sky-400">{scenario.title}</h3>
          </div>
          <span className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
            {scenario.difficulty}
          </span>
        </div>
        
        <p className="text-gray-300 mb-6">{scenario.description}</p>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Target className="w-4 h-4" />
            <span>{scenario.category}</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{scenario.estimatedTime || '15-20 min'}</span>
          </div>
        </div>

        {scenario.objectives && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Learning Objectives:</h4>
            <ul className="space-y-1">
              {scenario.objectives.map((objective, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-sky-400">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStartChallenge();
          }}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:from-sky-500 hover:to-blue-600 flex items-center justify-center gap-2"
        >
          Start Challenge
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ScenarioCard;