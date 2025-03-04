import { API_BASE_URL } from "../../../config/config";
// src/components/features/ScenarioChallenge/ScenarioChallenge.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Shield, 
  FileText,
  Globe,
  Users,
  Heart,
  PiggyBank,
  Calculator,
  Image,
  RefreshCw,
  Timer,
  Bitcoin,
  AlertTriangle,
  TrendingDown,
  BookOpen, 
  Target, 
  DollarSign, 
  Briefcase, 
  Search,
  AlertCircle,
  Clock,
  Award,
  RotateCw,
  CheckCircle2,
  Stethoscope,
  Scale,
  HeartHandshake,
  RefreshCcw,     // <-- NEW import
  Loader          // Make sure Loader is imported if you use it
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScenarioCard from './ScenarioCard';
import { useAuth } from '../../../contexts/AuthContext';
import ApiService from '../../../services/apiService';

// Example domain configuration — adjust as needed
const PROFESSIONAL_DOMAINS = {
  FINANCIAL: {
    id: 'financial',
    name: 'Financial',
    description: 'Investment, retirement, estate, tax, and risk management scenarios',
    categories: [
      'Investment Planning',
      'Retirement Planning',
      'Estate Planning',
      'Tax Planning',
      'Risk Management'
    ]
  },
  SALES: {
    id: 'sales',
    name: 'Sales',
    description: 'Product and service sales scenarios across different industries',
    categories: [
      'Automotive Sales',
      'Insurance Sales',
      'Real Estate Sales',
      'Software/Tech Sales',
      'Retail Sales',
      'B2B Sales',
      'Medical Device Sales'
    ],
    subCategories: {
      'Automotive Sales': [
        'Luxury Vehicles',
        'Electric Vehicles',
        'Commercial Vehicles',
        'Used Vehicles'
      ],
      'Insurance Sales': [
        'Life Insurance',
        'Health Insurance',
        'Property Insurance',
        'Business Insurance'
      ],
      'Real Estate Sales': [
        'Residential',
        'Commercial',
        'Industrial',
        'Investment Properties'
      ],
      'Software/Tech Sales': [
        'Enterprise Solutions',
        'SaaS Products',
        'Cybersecurity',
        'Cloud Services'
      ]
    }
  },
  MEDICAL: {
    id: 'medical',
    name: 'Medical',
    description: 'Healthcare advice, patient counseling, diagnostic challenges',
    categories: [
      'Primary Care',
      'Emergency Medicine',
      'Specialist Consultation',
      'Preventive Care',
      'Chronic Disease Management'
    ]
  },
  LEGAL: {
    id: 'legal',
    name: 'Legal',
    description: 'Client consultations, case strategy, negotiations',
    categories: [
      'Criminal Defense',
      'Family Law',
      'Corporate Law',
      'Real Estate Law',
      'Immigration Law'
    ]
  },
  COUNSELING: {
    id: 'counseling',
    name: 'Counseling',
    description: 'Therapeutic approaches, mental health scenarios, family therapy',
    categories: [
      'Individual Therapy',
      'Couples Counseling',
      'Family Therapy',
      'Grief Counseling',
      'Addiction Recovery'
    ]
  },
  EDUCATION: {
    id: 'education',
    name: 'Education',
    description: 'Classroom management, lesson planning, parent-teacher scenarios',
    categories: [
      'Elementary Education',
      'Secondary Education',
      'Special Education',
      'College Counseling',
      'Career Guidance'
    ]
  }
};

// --------------------
// FINANCIAL SCENARIOS
// --------------------
const initialScenarios = [
  {
    id: 1,
    domain: 'financial',
    category: "Investment Planning",
    title: "Portfolio Diversification Strategy",
    description: "A high-net-worth client seeks guidance on diversifying their portfolio, which is currently heavily concentrated in tech stocks...",
    icon: <Target className="w-5 h-5 text-sky-400" />,
    difficulty: "Intermediate",
    objectives: [
      "Assess current portfolio concentration risk",
      "Explain diversification principles",
      "Recommend optimal asset allocation",
      "Address concerns about potential return impact"
    ],
    estimatedTime: "20-25 min",
    keyPoints: [
      "Current portfolio: 80% tech stocks",
      "Risk tolerance: Moderate",
      "Investment horizon: 15+ years",
      "Concerns about market volatility"
    ]
  },
  {
    id: 2,
    domain: 'financial',
    category: "Retirement Planning",
    title: "Early Retirement and Financial Independence",
    description: "A couple in their mid-30s wants to achieve financial independence and retire by age 50...",
    icon: <Briefcase className="w-5 h-5 text-sky-400" />,
    difficulty: "Advanced",
    objectives: [
      "Calculate required retirement savings",
      "Develop sustainable withdrawal strategy",
      "Plan for healthcare costs pre-Medicare",
      "Create tax-efficient investment plan"
    ],
    estimatedTime: "30-35 min",
    keyPoints: [
      "Combined income: $200,000/year",
      "Current savings: $300,000",
      "Desired retirement age: 50",
      "Need to maintain lifestyle flexibility"
    ]
  },
  // ... include all your other financial scenarios with `domain: 'financial'` ...
];

// Domain card component
const DomainSection = ({ domain, isSelected, onSelect }) => {
  const Icon = {
    financial: Briefcase,
    medical: Stethoscope,
    legal: Scale,
    counseling: HeartHandshake,
    education: GraduationCap
  }[domain.id] || Briefcase;

  return (
    <button
      onClick={() => onSelect(domain.id)} // <--- calls handleDomainSelect
      className={`p-6 rounded-xl border transition-all duration-300 text-left ${
        isSelected
          ? 'bg-sky-900/50 border-sky-500'
          : 'bg-gray-900/50 border-gray-800 hover:border-sky-900/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-sky-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-2">{domain.name}</h3>
          <p className="text-sm text-gray-400">{domain.description}</p>
        </div>
      </div>
    </button>
  );
};

const ScenarioChallenge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [success, setSuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState('');

  // Filters
  const [selectedDomain, setSelectedDomain] = useState('financial');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // For domain-based display
  const domainConfig = PROFESSIONAL_DOMAINS[selectedDomain.toUpperCase()];

  // Category/difficulty data
  const categories = [
    { id: 'all', name: 'All Categories' },
    ...(domainConfig?.categories || []).map(cat => ({
      id: cat,
      name: cat
    }))
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'Intermediate', name: 'Intermediate' },
    { id: 'Advanced', name: 'Advanced' },
    { id: 'Expert', name: 'Expert' }
  ];

  // -------------------------------
  //  Fetch Scenarios from server
  // -------------------------------
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, clear existing scenarios for this domain
        setScenarios(prevScenarios => 
          prevScenarios.filter(s => s.domain !== selectedDomain)
        );
        
        const data = await ApiService.getScenariosByDomain(selectedDomain);
        
        // Only set scenarios for the current domain
        setScenarios(prevScenarios => {
          // Filter out any existing scenarios for this domain to avoid duplicates
          const otherScenarios = prevScenarios.filter(s => s.domain !== selectedDomain);
          // Add new scenarios with domain verification
          const newScenarios = data.filter(s => s.domain === selectedDomain);
          return [...otherScenarios, ...newScenarios];
        });
      } catch (err) {
        console.error('Error fetching scenarios:', err);
        setError('Failed to fetch scenarios for this domain');
        // On error, reset scenarios for this domain
        setScenarios(prevScenarios => 
          prevScenarios.filter(s => s.domain !== selectedDomain)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [selectedDomain]);

  // -------------------------------
  //  Admin reset (original button)
  // -------------------------------
  const handleResetScenarios = async () => {
    try {
      setIsResetting(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/scenarios/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reset scenarios');
      }

      const data = await response.json();
      setScenarios(data.scenarios);
      setSuccess('Scenarios have been reset successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Reset error:', err);
      setError('Failed to reset scenarios. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  // -------------------------------
  //  Generate new scenarios for domain
  // -------------------------------
  const handleDomainSelect = async (domainId) => {
    try {
      setSelectedDomain(domainId);
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      // First try to fetch existing scenarios for this domain
      const response = await fetch(`${API_BASE_URL}/api/scenarios?domain=${domainId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scenarios');
      }

      const data = await response.json();
      
      // If we got scenarios back, use them
      if (data && data.length > 0) {
        setScenarios(prevScenarios => {
          const otherScenarios = prevScenarios.filter(s => s.domain !== domainId);
          return [...otherScenarios, ...data];
        });
      } else {
        // If no scenarios exist, generate new ones
        const generateResponse = await fetch(`${API_BASE_URL}/api/scenarios/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ domain: domainId })
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to generate scenarios');
        }

        const generatedData = await generateResponse.json();
        setScenarios(prevScenarios => {
          const otherScenarios = prevScenarios.filter(s => s.domain !== domainId);
          return [...otherScenarios, ...generatedData];
        });
      }
    } catch (err) {
      console.error('Error handling domain selection:', err);
      setError('Failed to load scenarios for this domain');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  //  Refresh (delete + regenerate) domain scenarios
  // -------------------------------
  const handleRefreshDomain = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/scenarios/refresh/${selectedDomain}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh scenarios');
      }

      // The refresh route might respond with the newly generated scenarios
      // or a custom message. If it's the new scenarios, we can do:
      const data = await response.json();

      // If data is an array of scenarios, store them:
      if (Array.isArray(data)) {
        // Replace scenarios for current domain:
        setScenarios(prevScenarios => {
          const otherScenarios = prevScenarios.filter(s => s.domain !== selectedDomain);
          return [...otherScenarios, ...data];
        });
      }
      // if data is an object with "message" and "data", adjust accordingly

      setSuccess('Scenarios refreshed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error refreshing scenarios:', err);
      setError('Failed to refresh scenarios');
    } finally {
      setLoading(false);
    }
  };

  // Get subcategories for selected category
  const getSubCategories = () => {
    const domain = PROFESSIONAL_DOMAINS[selectedDomain.toUpperCase()];
    if (!domain?.subCategories || !domain.subCategories[selectedCategory]) {
      return [];
    }
    return [
      { id: 'all', name: 'All Subcategories' },
      ...domain.subCategories[selectedCategory].map(sub => ({
        id: sub,
        name: sub
      }))
    ];
  };

  // -------------------------------
  //  Filter Scenarios
  // -------------------------------
  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesDomain = scenario.domain === selectedDomain;
    const matchesCategory =
      selectedCategory === 'all' || scenario.category === selectedCategory;
    const matchesSubCategory =
      selectedSubCategory === 'all' || scenario.subCategory === selectedSubCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
    const matchesSearch =
      !searchQuery ||
      scenario.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesDomain &&
      matchesCategory &&
      matchesSubCategory &&
      matchesDifficulty &&
      matchesSearch
    );
  });

  // -------------------------------
  //  Generate More scenarios
  // -------------------------------
  const handleGenerateMore = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationSuccess('');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/scenarios/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: selectedDomain,
          category: selectedCategory !== 'all' ? selectedCategory : null,
          subCategory: selectedSubCategory !== 'all' ? selectedSubCategory : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenarios');
      }

      const newScenarios = await response.json();
      setScenarios(prev => [...prev, ...newScenarios]);
      setGenerationSuccess('New scenarios generated successfully!');
    } catch (err) {
      console.error('Error generating scenarios:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">

        {/* Header with domain-based title + refresh + reset */}
        <div className="flex items-center justify-between mb-8">
          {/* Left side: domain name + refresh */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-4">
                {domainConfig?.name} Scenarios
              </h1>
              <p className="text-gray-400 text-lg">
                Choose a scenario to practice your {domainConfig?.name.toLowerCase()} skills
              </p>
            </div>
            <button
              onClick={handleRefreshDomain}
              disabled={loading}
              className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCcw className="w-5 h-5" />
              )}
              Refresh Scenarios
            </button>
          </div>

          {/* Right side: Admin-only reset all scenarios */}
          {user?.isAdmin && (
            <button
              onClick={handleResetScenarios}
              disabled={isResetting}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCw className="w-5 h-5" />
                  Reset Scenarios
                </>
              )}
            </button>
          )}
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-green-500">{success}</p>
          </div>
        )}

        {/* Generation Success Message */}
        {generationSuccess && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-green-500">{generationSuccess}</p>
          </div>
        )}

        {/* Domain Selection Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Select Professional Domain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(PROFESSIONAL_DOMAINS).map((domain) => (
              <DomainSection
                key={domain.id}
                domain={domain}
                isSelected={selectedDomain === domain.id}
                onSelect={handleDomainSelect}
              />
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setSelectedCategory('all');
              setSelectedSubCategory('all');
            }}
            className="bg-gray-800 text-white rounded-lg p-2"
          >
            {Object.values(PROFESSIONAL_DOMAINS).map(domain => (
              <option key={domain.id} value={domain.id}>{domain.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubCategory('all');
            }}
            className="bg-gray-800 text-white rounded-lg p-2"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          {/* Subcategory Filter - Only show if category has subcategories */}
          {getSubCategories().length > 0 && (
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="bg-gray-800 text-white rounded-lg p-2"
            >
              {getSubCategories().map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          )}

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-gray-800 text-white rounded-lg p-2"
          >
            {difficulties.map(diff => (
              <option key={diff.id} value={diff.id}>{diff.name}</option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Generate More Button */}
          <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg p-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" />
                Generate More
              </>
            )}
          </button>
        </div>

        {/* Scenario Grid */}
        {filteredScenarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario._id || scenario.id}
                scenario={scenario}
                // If needed, pass domain info to the card
                domain={PROFESSIONAL_DOMAINS[scenario.domain?.toUpperCase()]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No scenarios found matching your criteria.
              Try adjusting your filters or search query.
            </p>
          </div>
        )}

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
              Practice your professional approach in a simulated conversation
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
