// src/components/features/ScenarioChallenge/Simulation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Send, 
  User, 
  MessageSquare, 
  Bot, 
  Loader, 
  Brain, 
  AlertCircle 
} from 'lucide-react';
import DetailedPersonaView from '../ClientPersonas/DetailedPersonaView';
import VoiceControls from '../Voice/VoiceControls';
import EvaluatorModal from './EvaluatorModal';
import SimulationHeader from './SimulationHeader';
import MentorPanel from './MentorPanel';

const API_BASE_URL = 'http://localhost:5001/api';

// Message Bubble Component
const MessageBubble = ({ message, isUser, isMentor }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div
      className={`max-w-[80%] rounded-xl p-4 ${
        isUser 
          ? 'bg-sky-600 text-white' 
          : isMentor
          ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700'
          : message.role === 'system'
          ? 'bg-gray-800/50 text-gray-300 border border-gray-700'
          : 'bg-gray-800 text-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-1 text-sm opacity-75">
        {isUser ? (
          <>
            <User className="w-4 h-4" />
            <span>Financial Advisor</span>
          </>
        ) : isMentor ? (
          <>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">Mentor</span>
          </>
        ) : message.role !== 'system' && (
          <>
            <Bot className="w-4 h-4" />
            <span>Client</span>
          </>
        )}
      </div>
      {message.content}
    </div>
  </div>
);

const Simulation = ({ isGuest = false, initialData = null, onEnd = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [startTime] = useState(new Date());
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMentorEnabled, setIsMentorEnabled] = useState(false);
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get simulation data from props or location state
  const simulationData = initialData || location.state;
  
  // Extract features from guestData
  const guestFeatures = isGuest ? simulationData?.guestData?.features || {} : {};
  const guestCode = isGuest ? simulationData?.guestData?.code : null;
  
  // Initialize feature flags
  const canUseMentor = !isGuest || Boolean(guestFeatures.mentorEnabled);
  const canUseEvaluator = !isGuest || Boolean(guestFeatures.evaluatorEnabled);

  // Set initial mentor state based on features
  useEffect(() => {
    if (isGuest && guestFeatures.mentorEnabled) {
      setIsMentorEnabled(true);
    }
  }, [isGuest, guestFeatures.mentorEnabled]);

  // Redirect if no simulation data
  useEffect(() => {
    if (!simulationData?.data) {
      navigate(isGuest ? '/guest' : '/dashboard');
    }
  }, [simulationData, navigate, isGuest]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (simulationData?.data) {
      setChatHistory([{
        role: 'assistant',
        content: 'Welcome! I am your virtual client for this simulation. Please introduce yourself and begin the advisory session.'
      }]);
    }
  }, [simulationData?.data]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Helper function to get headers
  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (isGuest && guestCode) {
      headers.guestcode = guestCode;
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  };

  // Prepare context data based on type
  const getContextData = () => {
    if (simulationData.type === 'persona') {
      return {
        name: simulationData.data.name,
        age: simulationData.data.age,
        income: simulationData.data.income,
        portfolio: simulationData.data.portfolio,
        riskTolerance: simulationData.data.riskTolerance,
        goals: simulationData.data.goals,
        concerns: simulationData.data.concerns,
        knowledgeLevel: simulationData.data.knowledgeLevel
      };
    }

    return {
      title: simulationData.data.title,
      category: simulationData.data.category,
      description: simulationData.data.description,
      difficulty: simulationData.data.difficulty,
      objectives: simulationData.data.objectives || [],
      background: simulationData.data.background || '',
      clientProfile: simulationData.data.clientProfile || {
        name: "Client",
        age: 45,
        income: "$100,000",
        portfolio: "Diversified portfolio",
        riskTolerance: "Moderate",
        goals: "Financial stability",
        concerns: "Market uncertainty",
        knowledgeLevel: "Intermediate"
      }
    };
  };

  // Handle chat submission
  const handleSubmit = async (e, directMessage = null) => {
    e?.preventDefault();
    if (!simulationData?.data) return;
    
    setIsLoading(true);
    setError(null);
    const messageToSend = directMessage || message;
  
    try {
      console.log('Sending chat request:', {
        isGuest,
        guestCode,
        messageToSend
      });
  
      const newMessage = { role: 'user', content: messageToSend };
      setChatHistory(prev => [...prev, newMessage]);
      setMessage('');
  
      // Fix: Updated endpoint construction
      const endpoint = isGuest 
        ? `${API_BASE_URL}/guest/chat`
        : `${API_BASE_URL}/chat`;
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: chatHistory.filter(msg => msg.role !== 'system'),
          type: simulationData.type,
          context: { 
            data: getContextData() 
          }
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Invalid response format from server');
      }
  
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
      setChatHistory(prev => [...prev, {
        role: 'system',
        content: 'I apologize, but I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
      // Focus the input field after message submission
      inputRef.current?.focus();
    }
  };

  // Handle voice input
  const handleVoiceInput = (transcription) => {
    if (transcription?.trim()) {
      handleSubmit(null, transcription);
    }
  };

  // Handle voice error
  const handleVoiceError = (error) => {
    console.error('Voice error:', error);
    setError('Voice input error. Please try again.');
  };

  // Handle navigation back
  const handleBack = () => {
    if (isGuest) {
      navigate('/guest/selection', {
        state: location?.state?.guestData || {},
        replace: true
      });
    } else {
      if (simulationData?.type === 'persona') {
        navigate('/client-personas');
      } else if (simulationData?.type === 'scenario') {
        navigate('/scenario-challenge');
      } else {
        navigate(-1);
      }
    }
  };

  // Handle end simulation
  const handleEndSimulation = () => {
    if (isGuest && onEnd) {
      onEnd();
    } else {
      setIsEvaluatorOpen(true);
    }
  };

  if (!simulationData?.data) {
    return null;
  }

  const lastAssistantMessage = chatHistory
    .filter(msg => msg.role === 'assistant')
    .slice(-1)[0]?.content || '';

  return (
    <div className="min-h-screen bg-black">
      <SimulationHeader 
        scenarioData={simulationData.data}
        onEndChat={handleEndSimulation}
        onBackClick={handleBack}
        startTime={startTime}
        isMentorEnabled={isMentorEnabled}
        onMentorToggle={() => setIsMentorEnabled(prev => !prev)}
        showMentorToggle={canUseMentor}
        isGuest={isGuest}
      />

      {canUseMentor && (
        <MentorPanel 
          isVisible={isMentorEnabled}
          chatHistory={chatHistory}
          scenarioData={{
            type: simulationData.type,
            ...simulationData.data
          }}
          isGuest={isGuest}
          guestCode={guestCode}
          onSuggestionClick={suggestion => setMessage(suggestion)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-24">
        {/* Scenario/Persona Information */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-800">
          {simulationData.type === 'persona' ? (
            <DetailedPersonaView persona={simulationData.data} />
          ) : (
            <>
              <h2 className="text-lg font-semibold text-sky-400 mb-4">Scenario Overview</h2>
              <p className="text-gray-300 mb-4">{simulationData.data.description}</p>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {simulationData.data.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-sm ${
                  simulationData.data.difficulty === 'Expert' 
                    ? 'bg-red-900/50 text-red-400'
                    : simulationData.data.difficulty === 'Advanced'
                    ? 'bg-orange-900/50 text-orange-400'
                    : 'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {simulationData.data.difficulty}
                </span>
              </div>
              {simulationData.data.objectives && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Objectives:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {simulationData.data.objectives.map((objective, index) => (
                      <li key={index} className="text-gray-300 text-sm">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat Messages */}
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <MessageBubble 
              key={index}
              message={msg}
              isUser={msg.role === 'user'}
              isMentor={msg.role === 'mentor'}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-xl p-4 text-gray-200">
                <div className="flex items-center gap-2">
                  <div className="animate-bounce">⋯</div>
                  <span className="text-sm text-gray-400">Thinking</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Evaluator Modal */}
      {canUseEvaluator && (
        <EvaluatorModal 
          isOpen={isEvaluatorOpen}
          onClose={() => setIsEvaluatorOpen(false)}
          chatHistory={chatHistory}
          scenarioData={simulationData.data}
          isGuest={isGuest}
          guestCode={guestCode}
        />
      )}

      {/* Chat Input Form */}
      <form
        onSubmit={async (e) => {
          await handleSubmit(e);
          // Force focus back to input after a small delay
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900/80 border-t border-gray-800 backdrop-blur-sm p-4"
      >
        <div className="max-w-6xl mx-auto flex gap-4 items-center">
          <VoiceControls
            onTranscription={handleVoiceInput}
            onError={handleVoiceError}
            disabled={isLoading}
            text={lastAssistantMessage}
            autoPlay={true}
            isGuest={isGuest}
            guestCode={guestCode}
          />

          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500"
            disabled={isLoading}
            onBlur={(e) => {
              // Prevent losing focus
              e.target.focus();
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-900/90 text-white px-6 py-3 rounded-lg border border-red-700 backdrop-blur-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-300" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Simulation;