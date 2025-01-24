// src/components/features/ScenarioChallenge/MentorPanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  AlertTriangle,
  Loader,
  MessageSquare,
  Sparkles,
  Target,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const SuggestionCard = ({ suggestion, onClick }) => (
  <button
    onClick={() => onClick(suggestion)}
    className="group w-full p-4 text-left text-sm bg-gradient-to-br from-emerald-900/30 to-sky-900/30 
               hover:from-emerald-900/40 hover:to-sky-900/40 rounded-lg transition-all duration-300 
               border border-emerald-800/50 hover:border-emerald-700/50 transform hover:-translate-y-0.5"
  >
    <div className="flex items-start gap-2">
      <Target className="w-4 h-4 text-emerald-400 mt-0.5 transform group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-emerald-200 leading-relaxed">{suggestion}</span>
    </div>
  </button>
);

const MentorPanel = ({ 
  isVisible, 
  chatHistory,
  scenarioData,
  onSuggestionClick,
  isGuest = false,
  guestCode = null
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mentorResponse, setMentorResponse] = useState(null);
  const [lastAnalyzedLength, setLastAnalyzedLength] = useState(0);

  // Effect to trigger analysis on new messages
  useEffect(() => {
    if (chatHistory.length > lastAnalyzedLength && chatHistory.length > 1) {
      analyzeChatHistory();
    }
  }, [chatHistory.length]); // Only depend on the length to prevent infinite loops

  // Helper function to get auth headers
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

  const analyzeChatHistory = async () => {
    if (!isVisible || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Filter relevant chat messages
      const relevantMessages = chatHistory.filter(msg => 
        msg.role === 'user' || msg.role === 'assistant'
      ).slice(-6); // Get last 3 exchanges

      // Generate context based on scenario type
      const contextString = scenarioData.type === 'persona' 
        ? `Client Profile:
Age: ${scenarioData.age}
Income: ${scenarioData.income}
Goals: ${scenarioData.goals}
Risk Tolerance: ${scenarioData.riskTolerance}
Concerns: ${scenarioData.concerns}
Knowledge Level: ${scenarioData.knowledgeLevel}`
        : `Scenario Details:
Title: ${scenarioData.title}
Category: ${scenarioData.category}
Difficulty: ${scenarioData.difficulty}
Objectives: ${scenarioData.objectives?.join(', ')}`;

      const messages = [
        {
          role: 'system',
          content: `You are an expert financial advisory mentor reviewing a conversation with a client. Analyze the recent exchanges and provide constructive feedback.

Context:
${contextString}

Focus on:
1. Regulatory compliance and risk management
2. Communication effectiveness and professionalism
3. Addressing client needs and concerns

Provide:
1. Any compliance/regulatory warnings (be brief and specific)
2. Specific improvement suggestions for future responses
3. Positive observations about what was done well`
        },
        {
          role: 'user',
          content: `Here are the recent exchanges to analyze:

${relevantMessages.map(msg => 
  `${msg.role === 'user' ? 'Advisor' : 'Client'}: ${msg.content}`
).join('\n\n')}`
        }
      ];

      const response = await fetch('http://localhost:5001/api/chat/mentor', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error('Failed to get mentor response');
      }

      const data = await response.json();
      setMentorResponse(data);
      setLastAnalyzedLength(chatHistory.length);

    } catch (err) {
      console.error('Mentor analysis error:', err);
      setError(err.message || 'Failed to get mentor feedback');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-4 top-32 w-96 transition-all duration-500 ease-in-out transform">
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-900/98 rounded-2xl border border-emerald-800/50 
                    backdrop-blur-lg shadow-xl shadow-emerald-900/20">
        {/* Header */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center justify-between p-4 border-b border-emerald-800/50 cursor-pointer hover:bg-emerald-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-emerald-400" />
              <Sparkles className="w-4 h-4 text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-400">AI Mentor</h3>
              <p className="text-xs text-emerald-300/70">Providing real-time feedback</p>
            </div>
          </div>
          {isMinimized ? (
            <ChevronUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-emerald-400" />
          )}
        </div>

        {/* Content Area */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isMinimized ? 'max-h-0' : 'max-h-[550px]'
          }`}
        >
          <div className="p-4 space-y-4 overflow-y-auto max-h-[550px]">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-emerald-400 py-4">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing conversation...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-950/20 rounded-lg p-4 border border-red-900/50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {mentorResponse && (
              <div className="space-y-4">
                {/* Warning */}
                {mentorResponse.warning && (
                  <div className="bg-red-950/20 rounded-lg p-4 border border-red-900/50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-400 mb-1">Warning</p>
                        <p className="text-sm text-red-300/90">{mentorResponse.warning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {mentorResponse.suggestions?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Lightbulb className="w-4 h-4" />
                      <p className="text-sm font-medium">Suggested Improvements</p>
                    </div>
                    <div className="space-y-2">
                      {mentorResponse.suggestions.map((suggestion, index) => (
                        <SuggestionCard
                          key={index}
                          suggestion={suggestion}
                          onClick={onSuggestionClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Communication Tip */}
                {mentorResponse.tip && (
                  <div className="bg-emerald-950/20 rounded-lg p-4 border border-emerald-900/50">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-900/30 rounded-lg p-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-400 mb-1">What You Did Well</p>
                        <p className="text-sm text-emerald-300/90 leading-relaxed">
                          {mentorResponse.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorPanel;