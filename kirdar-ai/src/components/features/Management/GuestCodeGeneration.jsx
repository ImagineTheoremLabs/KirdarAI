import React, { useState, useEffect } from 'react';
import { Plus, Loader, Users, Target, Brain, Award } from 'lucide-react';
import Modal from '../../common/Modal/Modal';

const FeatureToggle = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0">
    <div>
      <h3 className="text-white font-medium">{label}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={enabled}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
    </label>
  </div>
);

const ContentItem = ({ item, isSelected, onToggle, type }) => (
  <label className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(item._id)}
        className="hidden"
      />
      <div className={`w-5 h-5 rounded flex items-center justify-center ${
        isSelected 
          ? 'bg-sky-500 text-white' 
          : 'bg-gray-700 border border-gray-600'
      }`}>
        {isSelected && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="text-white font-medium">
          {type === 'persona' ? item.name : item.title}
        </h3>
        {type === 'scenario' && (
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            item.difficulty === 'Expert' 
              ? 'bg-red-900/50 text-red-400'
              : item.difficulty === 'Advanced'
              ? 'bg-orange-900/50 text-orange-400'
              : 'bg-yellow-900/50 text-yellow-400'
          }`}>
            {item.difficulty}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 mt-1">
        {type === 'persona' ? item.goals : item.description}
      </p>
    </div>
  </label>
);

const GuestCodeGeneration = ({ onCodeGenerated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMentorEnabled, setIsMentorEnabled] = useState(false);
  const [isEvaluatorEnabled, setIsEvaluatorEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [activeTab, setActiveTab] = useState('features');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!isModalOpen) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [personasResponse, scenariosResponse] = await Promise.all([
          fetch('http://localhost:5001/api/personas', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5001/api/scenarios', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!personasResponse.ok || !scenariosResponse.ok) {
          throw new Error('Failed to fetch content');
        }

        const [personasData, scenariosData] = await Promise.all([
          personasResponse.json(),
          scenariosResponse.json()
        ]);

        setPersonas(personasData);
        setScenarios(scenariosData);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [isModalOpen]);

  const handleGenerateCode = async () => {
    try {
      setIsGenerating(true);
      const token = localStorage.getItem('token');
      
      const requestData = {
        features: {
          mentorEnabled: isMentorEnabled,
          evaluatorEnabled: isEvaluatorEnabled
        },
        assignments: {
          personas: selectedPersonas,
          scenarios: selectedScenarios
        }
      };

      console.log('Generating code with data:', requestData);
      
      const response = await fetch('http://localhost:5001/api/admin/guest/codes/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate guest code');
      }

      const data = await response.json();
      console.log('Generated code:', data);
      
      if (onCodeGenerated) {
        onCodeGenerated();
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error generating code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setIsMentorEnabled(false);
    setIsEvaluatorEnabled(false);
    setSelectedPersonas([]);
    setSelectedScenarios([]);
    setActiveTab('features');
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Generate Guest Code
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Generate Guest Access Code"
      >
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-2 px-1 ${
                activeTab === 'features'
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-2 px-1 ${
                activeTab === 'content'
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Assign Content
            </button>
          </div>

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-2">
              <FeatureToggle
                label="AI Mentor"
                description="Enable real-time feedback and suggestions during the simulation"
                enabled={isMentorEnabled}
                onChange={(e) => setIsMentorEnabled(e.target.checked)}
              />
              <FeatureToggle
                label="Performance Evaluation"
                description="Enable detailed performance analysis after completing the simulation"
                enabled={isEvaluatorEnabled}
                onChange={(e) => setIsEvaluatorEnabled(e.target.checked)}
              />
            </div>
          )}

          {/* Content Assignment Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader className="animate-spin h-8 w-8 text-sky-500" />
                </div>
              ) : (
                <>
                  {/* Personas Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-sky-400" />
                      Client Personas
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {personas.map((persona) => (
                        <ContentItem
                          key={persona._id}
                          item={persona}
                          type="persona"
                          isSelected={selectedPersonas.includes(persona._id)}
                          onToggle={(id) => {
                            setSelectedPersonas(prev => 
                              prev.includes(id) 
                                ? prev.filter(p => p !== id)
                                : [...prev, id]
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Scenarios Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-sky-400" />
                      Practice Scenarios
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {scenarios.map((scenario) => (
                        <ContentItem
                          key={scenario._id}
                          item={scenario}
                          type="scenario"
                          isSelected={selectedScenarios.includes(scenario._id)}
                          onToggle={(id) => {
                            setSelectedScenarios(prev => 
                              prev.includes(id) 
                                ? prev.filter(s => s !== id)
                                : [...prev, id]
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {/* Navigation Buttons */}
            <div>
              {activeTab === 'content' && (
                <button
                  onClick={() => setActiveTab('features')}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Back to Features
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              {activeTab === 'features' ? (
                <button
                  onClick={() => setActiveTab('content')}
                  className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-500 transition-colors"
                >
                  Next: Assign Content
                </button>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  disabled={isGenerating || (!selectedPersonas.length && !selectedScenarios.length)}
                  className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Generate Code
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GuestCodeGeneration;