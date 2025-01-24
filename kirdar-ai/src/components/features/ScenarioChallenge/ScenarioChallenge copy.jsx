// src/components/features/ScenarioChallenge/ScenarioChallenge.jsx
import { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  Shield, 
  Home, 
  FileText,
  Banknote,
  HeartPulse
} from 'lucide-react';
import ScenarioCard from './ScenarioCard';

const scenarios = [
  {
    id: 1,
    category: "Investment Planning",
    title: "Portfolio Diversification",
    description: "Help a client understand and implement portfolio diversification strategies for long-term growth and risk management.",
    icon: <Target className="w-5 h-5 text-sky-400" />,
    difficulty: "Intermediate",
    objectives: [
      "Explain diversification principles",
      "Assess risk tolerance",
      "Recommend asset allocation"
    ],
    estimatedTime: "20-25 min"
  },
  // ... rest of your scenarios
];

const categories = [
  { id: 'all', name: 'All Scenarios' },
  { id: 'Investment Planning', name: 'Investment Planning' },
  { id: 'Retirement Planning', name: 'Retirement Planning' },
  { id: 'Estate Planning', name: 'Estate Planning' },
  { id: 'Tax Planning', name: 'Tax Planning' },
  { id: 'Education Planning', name: 'Education Planning' },
  { id: 'Insurance Planning', name: 'Insurance Planning' },
  { id: 'Debt Management', name: 'Debt Management' },
  { id: 'Healthcare Planning', name: 'Healthcare Planning' },
  { id: 'Real Estate', name: 'Real Estate' }
];

const ScenarioChallenge = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredScenarios = selectedCategory === 'all'
    ? scenarios
    : scenarios.filter(scenario => scenario.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-4">
            Financial Advisory Scenarios
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose a scenario to practice your financial advisory skills. Each scenario presents unique challenges and learning opportunities.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max px-1 pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-semibold text-sky-400 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            How to Use Scenario Challenges
          </h2>
          <div className="space-y-4 text-gray-300">
            <p className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">1.</span>
              Select a scenario that matches your learning objectives
            </p>
            <p className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">2.</span>
              Review the scenario details and requirements
            </p>
            <p className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">3.</span>
              Practice your advisory approach in a simulated conversation
            </p>
            <p className="flex items-start gap-2">
              <span className="text-sky-400 font-bold">4.</span>
              Receive feedback on your recommendations and communication
            </p>
          </div>
        </div>

        {/* Difficulty Legend */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-900"></span>
            <span className="text-gray-400">Intermediate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-900"></span>
            <span className="text-gray-400">Advanced</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-900"></span>
            <span className="text-gray-400">Expert</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioChallenge;