// src/components/features/ScenarioChallenge/ScenarioChallenge.jsx
import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Shield, 
  Home, 
  FileText,
  Banknote,
  HeartPulse,
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
  Filter,
  AlertCircle,
  Loader,
  Clock,
  Award,
  ArrowRight,
  RotateCw,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScenarioCard from './ScenarioCard';
import scenarioService from '../../../services/scenarioService';
import { useAuth } from '../../../contexts/AuthContext';
// Add this to your ScenarioChallenge.jsx

const allScenarios = [
    {
      id: 1,
      category: "Investment Planning",
      title: "Portfolio Diversification Strategy",
      description: "A high-net-worth client seeks guidance on diversifying their portfolio, which is currently heavily concentrated in tech stocks. They need to balance growth potential with risk management.",
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
      category: "Retirement Planning",
      title: "Early Retirement and Financial Independence",
      description: "A couple in their mid-30s wants to achieve financial independence and retire by age 50. They need a comprehensive strategy that balances aggressive savings with lifestyle maintenance.",
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
    {
      id: 3,
      category: "Estate Planning",
      title: "Complex Family Legacy Planning",
      description: "A business owner needs help structuring their estate plan to ensure fair distribution among children (some involved in the family business, others not) while minimizing tax impact.",
      icon: <FileText className="w-5 h-5 text-sky-400" />,
      difficulty: "Expert",
      objectives: [
        "Evaluate business succession options",
        "Design equitable inheritance structure",
        "Minimize estate tax exposure",
        "Address family dynamics"
      ],
      estimatedTime: "35-40 min",
      keyPoints: [
        "Business value: $5M+",
        "Multiple heirs with different roles",
        "Complex family dynamics",
        "Tax efficiency concerns"
      ]
    },
    {
      id: 4,
      category: "Tax Planning",
      title: "Strategic Tax-Loss Harvesting",
      description: "A high-income professional needs guidance on implementing tax-loss harvesting strategies while maintaining portfolio alignment with long-term goals.",
      icon: <DollarSign className="w-5 h-5 text-sky-400" />,
      difficulty: "Advanced",
      objectives: [
        "Identify tax-loss harvesting opportunities",
        "Maintain investment strategy integrity",
        "Navigate wash sale rules",
        "Optimize tax efficiency"
      ],
      estimatedTime: "25-30 min",
      keyPoints: [
        "High marginal tax bracket",
        "Substantial investment portfolio",
        "Regular taxable investment income",
        "Need for ongoing strategy"
      ]
    },
    {
      id: 5,
      category: "Education Planning",
      title: "Multi-Generation Education Funding",
      description: "Parents want to establish education funding plans for both their young children and potential future grandchildren while balancing their own retirement needs.",
      icon: <GraduationCap className="w-5 h-5 text-sky-400" />,
      difficulty: "Intermediate",
      objectives: [
        "Compare education funding vehicles",
        "Balance education vs retirement goals",
        "Structure multi-generation planning",
        "Optimize tax benefits"
      ],
      estimatedTime: "25-30 min",
      keyPoints: [
        "Multiple beneficiaries",
        "Long time horizon",
        "Tax efficiency needs",
        "Flexibility requirements"
      ]
    },
    {
      id: 6,
      category: "Risk Management",
      title: "Business Owner Risk Protection",
      description: "An entrepreneur needs a comprehensive risk management strategy covering both personal and business risks, including key person insurance and succession planning.",
      icon: <Shield className="w-5 h-5 text-sky-400" />,
      difficulty: "Expert",
      objectives: [
        "Assess business continuity risks",
        "Design comprehensive insurance strategy",
        "Plan business succession",
        "Protect personal assets"
      ],
      estimatedTime: "35-40 min",
      keyPoints: [
        "Growing business",
        "Key employee dependencies",
        "Personal guarantee exposure",
        "Family financial security"
      ]
    },
    {
      id: 7,
      category: "Investment Planning",
      title: "ESG Investment Integration",
      description: "A client wants to align their portfolio with their environmental and social values while maintaining competitive returns and proper diversification.",
      icon: <Target className="w-5 h-5 text-sky-400" />,
      difficulty: "Advanced",
      objectives: [
        "Define ESG investment criteria",
        "Maintain portfolio diversification",
        "Monitor ESG impact and performance",
        "Balance values with returns"
      ],
      estimatedTime: "25-30 min",
      keyPoints: [
        "Strong ESG preferences",
        "Return expectations",
        "Diversification needs",
        "Performance monitoring"
      ]
    },
    {
      id: 8,
      category: "Retirement Planning",
      title: "Pension vs. Lump Sum Decision",
      description: "A client approaching retirement must decide between taking a company pension or a lump sum distribution, considering various factors including longevity and legacy goals.",
      icon: <Briefcase className="w-5 h-5 text-sky-400" />,
      difficulty: "Advanced",
      objectives: [
        "Analyze pension vs. lump sum options",
        "Consider longevity risk",
        "Evaluate tax implications",
        "Assess legacy impact"
      ],
      estimatedTime: "30-35 min",
      keyPoints: [
        "Pension offer details",
        "Health and longevity factors",
        "Spouse considerations",
        "Legacy objectives"
      ]
    },
    {
      id: 9,
      category: "Estate Planning",
      title: "Charitable Legacy Design",
      description: "A philanthropically-minded wealthy client needs help structuring their charitable giving to maximize impact and tax efficiency while ensuring family needs are met.",
      icon: <FileText className="w-5 h-5 text-sky-400" />,
      difficulty: "Expert",
      objectives: [
        "Structure charitable giving vehicles",
        "Optimize tax benefits",
        "Balance family and charitable goals",
        "Design governance structure"
      ],
      estimatedTime: "35-40 min",
      keyPoints: [
        "Substantial charitable intent",
        "Complex tax situation",
        "Family involvement goals",
        "Long-term impact focus"
      ]
    },
    {
      id: 10,
      category: "Risk Management",
      title: "Pre-Retirement Risk Transition",
      description: "A client five years from retirement needs to adjust their risk management strategy to protect their accumulated wealth while maintaining growth potential.",
      icon: <Shield className="w-5 h-5 text-sky-400" />,
      difficulty: "Advanced",
      objectives: [
        "Assess current risk exposure",
        "Design transition strategy",
        "Protect accumulated wealth",
        "Maintain growth potential"
      ],
      estimatedTime: "30-35 min",
      keyPoints: [
        "Substantial accumulated assets",
        "Approaching retirement",
        "Risk tolerance shift",
        "Income needs planning"
      ]
    },
    {
        id: 11,
        category: "Investment Planning",
        title: "International Portfolio Expansion",
        description: "A client with a US-centric portfolio seeks to expand internationally, requiring guidance on global market exposure, currency risks, and emerging market opportunities.",
        icon: <Globe className="w-5 h-5 text-sky-400" />,
        difficulty: "Advanced",
        objectives: [
          "Evaluate international market opportunities",
          "Address currency risk concerns",
          "Structure global diversification strategy",
          "Consider tax implications of foreign investments"
        ],
        estimatedTime: "30-35 min",
        keyPoints: [
          "Current US-focused portfolio",
          "Interest in emerging markets",
          "Currency risk considerations",
          "Tax efficiency needs"
        ]
      },
      {
        id: 12,
        category: "Retirement Planning",
        title: "Late Career Retirement Catch-Up",
        description: "A 55-year-old professional who has under-saved for retirement needs a strategy to maximize retirement savings in their remaining working years.",
        icon: <Clock className="w-5 h-5 text-sky-400" />,
        difficulty: "Advanced",
        objectives: [
          "Maximize catch-up contributions",
          "Optimize Social Security strategy",
          "Adjust investment allocation",
          "Plan for healthcare costs"
        ],
        estimatedTime: "30-35 min",
        keyPoints: [
          "Limited retirement savings",
          "High current income",
          "10-year horizon to retirement",
          "Risk tolerance adjustment needed"
        ]
      },
      {
        id: 13,
        category: "Tax Planning",
        title: "Equity Compensation Optimization",
        description: "An executive with significant stock options and RSUs needs help developing an exercise and diversification strategy while managing tax implications.",
        icon: <DollarSign className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Develop option exercise strategy",
          "Plan RSU vesting management",
          "Minimize tax impact",
          "Create diversification timeline"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Multiple stock option grants",
          "RSU vesting schedule",
          "AMT considerations",
          "Company stock concentration"
        ]
      },
      {
        id: 14,
        category: "Estate Planning",
        title: "Blended Family Estate Strategy",
        description: "A recently remarried couple needs help structuring their estate plan to fairly provide for children from previous marriages while protecting current spouse's interests.",
        icon: <Users className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Balance competing family interests",
          "Structure inheritance timing",
          "Protect spouse's rights",
          "Minimize family conflicts"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Complex family dynamics",
          "Previous marriage assets",
          "Current spouse protection",
          "Fair inheritance goals"
        ]
      },
      {
        id: 15,
        category: "Risk Management",
        title: "Small Business Succession Planning",
        description: "A small business owner approaching retirement needs to develop a succession plan that ensures business continuity and maximizes value for retirement.",
        icon: <Briefcase className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Evaluate succession options",
          "Structure buy-sell agreement",
          "Plan leadership transition",
          "Optimize tax strategy"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Family business dynamics",
          "Key employee retention",
          "Valuation considerations",
          "Retirement income needs"
        ]
      },
      {
        id: 16,
        category: "Investment Planning",
        title: "Alternative Investment Integration",
        description: "A high-net-worth client interested in alternative investments needs guidance on incorporating private equity, hedge funds, and real estate into their portfolio.",
        icon: <Target className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Assess alternative investment options",
          "Evaluate liquidity constraints",
          "Structure portfolio allocation",
          "Address accreditation requirements"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Substantial investable assets",
          "Sophisticated investor status",
          "Liquidity considerations",
          "Risk tolerance assessment"
        ]
      },
      {
        id: 17,
        category: "Retirement Planning",
        title: "Social Security Timing Strategy",
        description: "A married couple needs help optimizing their Social Security claiming strategy to maximize lifetime benefits and survivor protection.",
        icon: <Clock className="w-5 h-5 text-sky-400" />,
        difficulty: "Intermediate",
        objectives: [
          "Compare claiming strategies",
          "Analyze breakeven scenarios",
          "Consider survivor benefits",
          "Integrate with retirement income"
        ],
        estimatedTime: "25-30 min",
        keyPoints: [
          "Age difference between spouses",
          "Different earnings histories",
          "Health considerations",
          "Other retirement income sources"
        ]
      },
      {
        id: 18,
        category: "Education Planning",
        title: "Special Needs Education Planning",
        description: "Parents of a child with special needs require guidance on funding future education and care needs while ensuring government benefit eligibility.",
        icon: <Heart className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Structure special needs trust",
          "Preserve benefit eligibility",
          "Plan for lifetime care needs",
          "Consider family support system"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Government benefit considerations",
          "Long-term care needs",
          "Family support planning",
          "Trust structure requirements"
        ]
      },
      {
        id: 19,
        category: "Investment Planning",
        title: "Retirement Income Portfolio Design",
        description: "A recently retired couple needs help structuring their investment portfolio to generate reliable income while maintaining growth potential.",
        icon: <PiggyBank className="w-5 h-5 text-sky-400" />,
        difficulty: "Advanced",
        objectives: [
          "Design income generation strategy",
          "Balance growth and stability",
          "Plan withdrawal sequence",
          "Monitor and adjust strategy"
        ],
        estimatedTime: "30-35 min",
        keyPoints: [
          "Monthly income needs",
          "Multiple account types",
          "Tax efficiency requirements",
          "Risk tolerance changes"
        ]
      },
      {
        id: 20,
        category: "Tax Planning",
        title: "Business Sale Tax Strategy",
        description: "A business owner preparing to sell their company needs guidance on structuring the sale to minimize taxes and maximize after-tax proceeds.",
        icon: <Calculator className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Structure sale terms",
          "Consider installment sale options",
          "Plan for capital gains impact",
          "Evaluate charitable strategies"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Substantial capital gains",
          "Business valuation issues",
          "Retirement planning impact",
          "Estate planning considerations"
        ]
      },
      {
        id: 21,
        category: "Risk Management",
        title: "Long-Term Care Planning",
        description: "A couple in their 50s needs to develop a strategy for potential long-term care needs while balancing other financial objectives.",
        icon: <Shield className="w-5 h-5 text-sky-400" />,
        difficulty: "Advanced",
        objectives: [
          "Compare insurance options",
          "Evaluate self-funding capability",
          "Consider hybrid products",
          "Plan for spouse protection"
        ],
        estimatedTime: "30-35 min",
        keyPoints: [
          "Family health history",
          "Current savings level",
          "Premium affordability",
          "Asset protection goals"
        ]
      },
      {
        id: 22,
        category: "Estate Planning",
        title: "Art Collection Legacy Planning",
        description: "A collector needs help incorporating their valuable art collection into their estate plan, addressing valuation, tax, and distribution challenges.",
        icon: <Image className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Plan collection valuation",
          "Structure gift strategy",
          "Consider charitable options",
          "Address family interests"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Significant collection value",
          "Specialized appraisal needs",
          "Family interest varies",
          "Tax efficiency goals"
        ]
      },
      {
        id: 23,
        category: "Investment Planning",
        title: "Post-Divorce Financial Reconstruction",
        description: "A recently divorced individual needs help restructuring their investment portfolio and financial plan after a significant division of assets.",
        icon: <RefreshCw className="w-5 h-5 text-sky-400" />,
        difficulty: "Advanced",
        objectives: [
          "Reassess financial goals",
          "Restructure investment strategy",
          "Plan for new circumstances",
          "Address income needs"
        ],
        estimatedTime: "30-35 min",
        keyPoints: [
          "Asset division impact",
          "Income change management",
          "New risk tolerance",
          "Changed time horizons"
        ]
      },
      {
        id: 24,
        category: "Retirement Planning",
        title: "Phased Retirement Planning",
        description: "A professional wants to gradually transition to retirement over 5-7 years, requiring a strategy that adjusts income, benefits, and investments accordingly.",
        icon: <Timer className="w-5 h-5 text-sky-400" />,
        difficulty: "Advanced",
        objectives: [
          "Structure income transition",
          "Plan benefits coordination",
          "Adjust investment strategy",
          "Optimize tax efficiency"
        ],
        estimatedTime: "30-35 min",
        keyPoints: [
          "Gradual work reduction",
          "Benefits continuation",
          "Income gap planning",
          "Portfolio transition"
        ]
      },
      {
        id: 25,
        category: "Tax Planning",
        title: "Cryptocurrency Tax Planning",
        description: "An active cryptocurrency investor needs help managing tax implications of trading, mining, and staking activities while ensuring compliance.",
        icon: <Bitcoin className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Track transaction basis",
          "Plan mining income strategy",
          "Structure staking activities",
          "Ensure reporting compliance"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Multiple crypto activities",
          "Complex transaction history",
          "Mining operation scale",
          "Reporting requirements"
        ]
      },
      {
        id: 26,
        category: "Risk Management",
        title: "Executive Benefits Optimization",
        description: "A corporate executive needs help maximizing their benefits package, including stock options, deferred compensation, and supplemental insurance.",
        icon: <Award className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Optimize benefit elections",
          "Plan deferred comp strategy",
          "Structure option exercises",
          "Coordinate insurance coverage"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Complex benefits package",
          "Multiple deferral options",
          "Risk management needs",
          "Tax optimization goals"
        ]
      },
      {
        id: 27,
        category: "Investment Planning",
        title: "Student Loan Management Strategy",
        description: "A medical professional with significant student loan debt needs help balancing loan repayment with retirement savings and other financial goals.",
        icon: <GraduationCap className="w-5 h-5 text-sky-400" />,
        difficulty: "Intermediate",
        objectives: [
          "Evaluate repayment options",
          "Balance competing goals",
          "Consider loan forgiveness",
          "Structure savings strategy"
        ],
        estimatedTime: "25-30 min",
        keyPoints: [
          "High loan balance",
          "Strong income potential",
          "Multiple financial goals",
          "Forgiveness eligibility"
        ]
      },
      {
        id: 28,
        category: "Estate Planning",
        title: "International Estate Planning",
        description: "A client with assets in multiple countries needs help structuring their estate plan to navigate different jurisdictions and tax treaties.",
        icon: <Globe className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Coordinate multiple jurisdictions",
          "Structure asset ownership",
          "Navigate tax treaties",
          "Plan document validity"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Multi-country assets",
          "Different legal systems",
          "Tax treaty impacts",
          "Family location factors"
        ]
      },
      {
        id: 29,
        category: "Risk Management",
        title: "Business Contingency Planning",
        description: "A partnership needs help developing a comprehensive contingency plan addressing death, disability, and departure scenarios.",
        icon: <AlertTriangle className="w-5 h-5 text-sky-400" />,
        difficulty: "Expert",
        objectives: [
          "Structure buy-sell agreement",
          "Plan funding strategy",
          "Address valuation methods",
          "Consider tax implications"
        ],
        estimatedTime: "35-40 min",
        keyPoints: [
          "Multiple partners",
          "Different ownership %",
          "Funding requirements",
          "Valuation methodology"
        ]
      },
      {
        id: 30,
        category: "Investment Planning",
        title: "Sustainable Withdrawal Strategy",
        description: "A retiree needs help developing a sustainable withdrawal strategy that considers market volatility, inflation, and longevity risks.",
        icon: <TrendingDown className="w-5 h-5 text-sky-400" />,
        difficulty: "Advanced",
        objectives: [
          "Calculate safe withdrawal rate",
          "Plan spending flexibility",
          "Address sequence risk",
          "Monitor and adjust strategy"
        ],
        estimatedTime: "30-35 min",
        keyPoints: [
          "Retirement portfolio size",
          "Income needs assessment",
          "Risk tolerance evaluation",
          "Longevity considerations"
        ]
      }
  ];

  const ScenarioChallenge = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [success, setSuccess] = useState('');
  
    const categories = [
      { id: 'all', name: 'All Categories' },
      { id: 'Investment Planning', name: 'Investment Planning' },
      { id: 'Retirement Planning', name: 'Retirement Planning' },
      { id: 'Estate Planning', name: 'Estate Planning' },
      { id: 'Tax Planning', name: 'Tax Planning' },
      { id: 'Risk Management', name: 'Risk Management' }
    ];
  
    const difficulties = [
      { id: 'all', name: 'All Levels' },
      { id: 'Intermediate', name: 'Intermediate' },
      { id: 'Advanced', name: 'Advanced' },
      { id: 'Expert', name: 'Expert' }
    ];
  
    useEffect(() => {
      const fetchScenarios = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          console.log('Fetching scenarios with token:', token ? 'Token exists' : 'No token');
  
          const response = await fetch('http://localhost:5001/api/scenarios', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch scenarios');
          }
  
          const data = await response.json();
          console.log('Fetched scenarios:', data);
          setScenarios(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Error fetching scenarios:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchScenarios();
    }, []);
  
    const handleResetScenarios = async () => {
      try {
        setIsResetting(true);
        setError('');
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5001/api/scenarios/reset', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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
  
    // Filter scenarios based on multiple criteria
    const filteredScenarios = scenarios.filter(scenario => {
      const matchesCategory = selectedCategory === 'all' || scenario.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
      const matchesSearch = !searchQuery || 
        scenario.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-4">
                Financial Advisory Scenarios
              </h1>
              <p className="text-gray-400 text-lg">
                Choose a scenario to practice your financial advisory skills
              </p>
            </div>
  
            {/* Reset Button for Admin */}
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
  
          {/* Filters */}
          <div className="mb-8 space-y-4">
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
  
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
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
  
            {/* Difficulty Filter */}
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDifficulty === difficulty.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {difficulty.name}
                </button>
              ))}
            </div>
          </div>
  
          {/* Scenarios Grid */}
          {filteredScenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard key={scenario._id} scenario={scenario} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No scenarios found matching your criteria. Try adjusting your filters or search query.
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