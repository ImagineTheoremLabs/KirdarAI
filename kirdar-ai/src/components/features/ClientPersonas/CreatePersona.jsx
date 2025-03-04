import React, { useState } from 'react';
import { 
  Bot, 
  Loader, 
  AlertCircle, 
  CheckCircle2,
  LightbulbIcon,
  Minus,
  Plus,
  BookOpen,
  User,
  BrainCircuit,
  Target,
  DollarSign,
  Send,
  AlertTriangle,
  Car,
  Building,
  Heart
} from 'lucide-react';
import ApiService from '../../../services/apiService';
import { DOMAIN_PROMPTS } from '../../../config/domainPrompts';

const CreatePersona = ({ onClose, onPersonaCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [numPersonas, setNumPersonas] = useState(1);
  const [generationStep, setGenerationStep] = useState('');
  const [showExamples, setShowExamples] = useState(true);
  const [generatedCount, setGeneratedCount] = useState(0);
  const MAX_PERSONAS = 20;
  const [selectedDomain, setSelectedDomain] = useState('financial');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleNumberChange = (increment) => {
    setNumPersonas(prev => {
      const newValue = prev + increment;
      return Math.min(Math.max(newValue, 1), MAX_PERSONAS);
    });
  };

  const handleDirectInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    setNumPersonas(Math.min(Math.max(value, 1), MAX_PERSONAS));
  };

  const examples = [
    {
      icon: <User className="w-5 h-5 text-emerald-400" />,
      title: "Established Professionals",
      description: "Senior executives with substantial equity compensation looking to plan for early retirement"
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      title: "Tech Entrepreneurs",
      description: "Startup founders who recently had successful exits and need help managing newfound wealth"
    },
    {
      icon: <Target className="w-5 h-5 text-sky-400" />,
      title: "Family Legacy",
      description: "Business owners planning succession and estate transfer to the next generation"
    },
    {
      icon: <DollarSign className="w-5 h-5 text-yellow-400" />,
      title: "Investment Clients",
      description: "High-net-worth investors seeking portfolio diversification and risk management strategies"
    }
  ];

  const generatePersonasBatch = async (description, totalCount) => {
    const batchSize = 5; // Process 5 personas at a time
    const batches = Math.ceil(totalCount / batchSize);
    const allPersonas = [];
    
    for (let i = 0; i < batches; i++) {
      const remainingCount = totalCount - (i * batchSize);
      const currentBatchSize = Math.min(batchSize, remainingCount);
      
      setGenerationStep(`Generating personas ${i * batchSize + 1} to ${Math.min((i + 1) * batchSize, totalCount)}...`);
      
      const personas = await ApiService.generatePersonas(description, currentBatchSize, false);
      allPersonas.push(...personas);
      
      setGeneratedCount(allPersonas.length);
    }
    
    return allPersonas;
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please provide a description of the personas you want to create');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedCount(0);
    setGenerationStep('Starting generation...');

    try {
      const personas = await generatePersonasBatch(description, numPersonas);
      
      setGenerationStep('Saving personas to database...');
      
      // Use bulk create instead of individual creates to avoid duplicate key errors
      try {
        await ApiService.createBulkPersonas(personas);
        setGenerationStep(`Saved all ${personas.length} personas`);
      } catch (createError) {
        console.error('Error creating personas in bulk:', createError);
        throw new Error(`Failed to create personas: ${createError.message}`);
      }

      onPersonaCreated();
      onClose();
    } catch (err) {
      console.error('Error in persona generation process:', err);
      setError(err.message || 'Failed to generate personas');
    } finally {
      setLoading(false);
      setGenerationStep('');
      setGeneratedCount(0);
    }
  };

  const getExamples = () => {
    switch (selectedDomain) {
      case 'sales':
        return [
          {
            icon: <Car className="w-5 h-5 text-blue-400" />,
            title: "Luxury Car Buyer",
            description: "High-net-worth individual looking to purchase a premium vehicle with specific customization requirements"
          },
          {
            icon: <Building className="w-5 h-5 text-green-400" />,
            title: "Commercial Property Investor",
            description: "Real estate developer seeking opportunities in prime commercial locations"
          },
          // Add more sales examples
        ];
      case 'medical':
        return [
          {
            icon: <Heart className="w-5 h-5 text-red-400" />,
            title: "Chronic Condition Patient",
            description: "Middle-aged patient managing multiple chronic conditions seeking comprehensive care plan"
          },
          // Add more medical examples
        ];
      // Add cases for other domains
      default:
        return examples; // Return original financial examples
    }
  };

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      {/* Title and Description */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-6 h-6 text-sky-400" />
          <h2 className="text-xl font-semibold text-white">Create Client Personas</h2>
        </div>
        <p className="text-gray-400">
          Generate detailed client personas for practice and training. You can create up to {MAX_PERSONAS} personas at once.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {numPersonas > 10 && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-500 font-medium">Large Batch Generation</p>
            <p className="text-yellow-400/80 text-sm">
              Generating {numPersonas} personas may take a few minutes. The process will run in batches to ensure reliability.
            </p>
          </div>
        </div>
      )}

      {/* Domain Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={selectedDomain}
          onChange={(e) => {
            setSelectedDomain(e.target.value);
            setSelectedCategory('');
          }}
          className="bg-gray-800 text-white rounded-lg p-2"
        >
          {Object.entries(DOMAIN_PROMPTS).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 text-white rounded-lg p-2"
        >
          <option value="">Select Category</option>
          {DOMAIN_PROMPTS[selectedDomain]?.categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Persona Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the client profiles you want to practice with..."
          className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none resize-none"
        />
      </div>

      {/* Number of Personas Selector */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Number of Personas
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNumberChange(-1)}
            disabled={numPersonas <= 1}
            className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <input
            type="number"
            value={numPersonas}
            onChange={handleDirectInput}
            min="1"
            max={MAX_PERSONAS}
            className="w-16 bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1 text-center text-white"
          />
          
          <button
            onClick={() => handleNumberChange(1)}
            disabled={numPersonas >= MAX_PERSONAS}
            className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-400 ml-2">
            (Maximum: {MAX_PERSONAS} personas)
          </span>
        </div>
      </div>

      {/* Examples grid with domain-specific examples */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-2 text-sm font-medium text-gray-300"
        >
          <LightbulbIcon className="w-4 h-4 text-yellow-500" />
          {selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Examples
        </button>

        {showExamples && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {getExamples().map((example, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer"
                onClick={() => setDescription(example.description)}
              >
                {example.icon}
                <div>
                  <h4 className="text-white font-medium">{example.title}</h4>
                  <p className="text-sm text-gray-400">{example.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {loading && generatedCount > 0 && (
        <div className="bg-sky-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sky-400 font-medium">Generation Progress</span>
            <span className="text-sky-400">{generatedCount}/{numPersonas}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-sky-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${(generatedCount / numPersonas) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !description.trim()}
        className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:from-sky-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="animate-spin h-5 w-5" />
            {generationStep || 'Generating Personas...'}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Generate {numPersonas} {numPersonas === 1 ? 'Persona' : 'Personas'}
          </>
        )}
      </button>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>
            Personas will be generated in batches and saved automatically
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreatePersona;