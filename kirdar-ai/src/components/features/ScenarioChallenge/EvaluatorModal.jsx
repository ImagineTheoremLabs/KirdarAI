// src/components/features/ScenarioChallenge/EvaluatorModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Star,
  ChartBar,
  Target,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Download,
  X,
  Loader,
  Brain,
  RefreshCw
} from 'lucide-react';

const ScoreCard = ({ category, score, description }) => {
  // Helper function to determine score color
  const getScoreColor = (score) => {
    if (score >= 9) return 'text-emerald-400';
    if (score >= 7) return 'text-sky-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-sky-400">{category}</h3>
        <div className="flex items-center gap-1">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400">/10</span>
        </div>
      </div>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
};

const EvaluatorModal = ({ 
  isOpen, 
  onClose, 
  chatHistory, 
  scenarioData,
  isGuest = false,
  guestCode = null 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!isOpen || evaluation) return;

      try {
        setLoading(true);
        setError(null);

        // Filter out system messages and format conversation
        const conversation = chatHistory
          .filter(msg => msg.role !== 'system' && msg.role !== 'mentor')
          .map(msg => ({
            role: msg.role === 'user' ? 'advisor' : 'client',
            content: msg.content
          }));

        // Create evaluation prompt
        const evaluationPrompt = {
          messages: [
            {
              role: "system",
              content: `You are an expert financial advisory evaluator. Analyze the following conversation between a financial advisor and client in the context of this scenario: 

Scenario Category: ${scenarioData.category}
Scenario Title: ${scenarioData.title}
Difficulty Level: ${scenarioData.difficulty}
Objectives: ${scenarioData.objectives?.join(', ')}

Provide a comprehensive evaluation including:
1. Numerical scores (1-10) for:
   - Technical Knowledge: Based on accuracy and depth of financial expertise
   - Communication Skills: Clarity, articulation, and effective explanation
   - Empathy and Relationship Building: Understanding and relating to client needs
   - Risk Management: Proper assessment and explanation of risks
   - Regulatory Compliance: Adherence to financial regulations and best practices
2. 3-5 key strengths demonstrated with specific examples
3. 3-5 specific areas for improvement with actionable recommendations
4. Brief overall assessment (2-3 sentences) and final score

IMPORTANT: Return ONLY the raw JSON object without any markdown formatting or code blocks. The response should start with { and end with } and be valid JSON. Use this exact structure:
{
  "scores": {
    "technicalKnowledge": number,
    "communication": number,
    "empathy": number,
    "riskManagement": number,
    "compliance": number
  },
  "strengths": [string],
  "improvementAreas": [string],
  "overallAssessment": string,
  "overallScore": number
}`
            },
            {
              role: "user",
              content: `Analyze this conversation:\n\n${JSON.stringify(conversation)}`
            }
          ]
        };

        // Get appropriate headers based on auth type
        const headers = {
          'Content-Type': 'application/json'
        };

        // Add either guest code or auth token
        if (isGuest && guestCode) {
          headers.guestcode = guestCode;
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        console.log('Sending evaluation request...');
        const response = await fetch('http://localhost:5001/api/chat/evaluate', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(evaluationPrompt)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server error');
        }

        const data = await response.json();
        console.log('Received evaluation:', data);

        // Validate the evaluation data
        if (!data.scores || !data.strengths || !data.improvementAreas) {
          throw new Error('Invalid evaluation data received');
        }

        setEvaluation(data);
      } catch (err) {
        console.error('Detailed evaluation error:', err);
        setError(err.message || 'Failed to evaluate conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [isOpen, chatHistory, scenarioData, evaluation, isGuest, guestCode]);

  if (!isOpen) return null;

  const handleDownloadReport = () => {
    if (!evaluation) return;

    const report = `
Financial Advisory Evaluation Report

Scenario: ${scenarioData.title}
Category: ${scenarioData.category}
Difficulty: ${scenarioData.difficulty}

Overall Score: ${evaluation.overallScore.toFixed(1)}/10

Detailed Scores:
- Technical Knowledge: ${evaluation.scores.technicalKnowledge.toFixed(1)}/10
- Communication: ${evaluation.scores.communication.toFixed(1)}/10
- Empathy: ${evaluation.scores.empathy.toFixed(1)}/10
- Risk Management: ${evaluation.scores.riskManagement.toFixed(1)}/10
- Compliance: ${evaluation.scores.compliance.toFixed(1)}/10

Key Strengths:
${evaluation.strengths.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${evaluation.improvementAreas.map(a => `- ${a}`).join('\n')}

Overall Assessment:
${evaluation.overallAssessment}

Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advisory-evaluation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-sky-400" />
            AI-Powered Performance Evaluation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-sky-500 animate-spin mb-4" />
              <p className="text-gray-400">Analyzing conversation...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setEvaluation(null);
                  setLoading(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Analysis
              </button>
            </div>
          ) : evaluation ? (
            <>
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-sky-900/50 to-blue-900/50 rounded-xl p-6 border border-sky-800 hover:border-sky-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Overall Performance</h3>
                    <p className="text-gray-400">AI-powered analysis of your advisory session</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-sky-400" />
                    <span className="text-3xl font-bold text-white">{evaluation.overallScore.toFixed(1)}</span>
                    <span className="text-lg text-gray-400">/10</span>
                  </div>
                </div>
                <p className="text-gray-300">{evaluation.overallAssessment}</p>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreCard
                  category="Technical Knowledge"
                  score={evaluation.scores.technicalKnowledge}
                  description="Understanding and explanation of financial concepts"
                />
                <ScoreCard
                  category="Communication"
                  score={evaluation.scores.communication}
                  description="Clarity and effectiveness of communication"
                />
                <ScoreCard
                  category="Empathy"
                  score={evaluation.scores.empathy}
                  description="Understanding and addressing client concerns"
                />
                <ScoreCard
                  category="Risk Management"
                  score={evaluation.scores.riskManagement}
                  description="Assessment and explanation of risks"
                />
                <ScoreCard
                  category="Compliance"
                  score={evaluation.scores.compliance}
                  description="Adherence to regulatory requirements"
                />
              </div>

              {/* Key Strengths */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <Star className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-sky-400" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  {evaluation.improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorModal;