// controllers/scenarioController.js
const Scenario = require('../models/Scenario');
const ScenarioAssignment = require('../models/ScenarioAssignment'); 
const User = require('../models/User');
const defaultScenarios = [
  // Investment Planning Scenarios
  {
    title: "Portfolio Diversification Strategy",
    category: "Investment Planning",
    description: "A high-net-worth client seeks guidance on diversifying their portfolio, which is currently heavily concentrated in tech stocks. They need to balance growth potential with risk management.",
    difficulty: "Intermediate",
    objectives: [
      "Assess current portfolio concentration risk",
      "Explain diversification principles",
      "Recommend optimal asset allocation",
      "Address concerns about potential return impact"
    ],
    estimatedTime: "20-25 min",
    iconType: "Target"
  },
  {
    title: "ESG Investment Integration",
    category: "Investment Planning",
    description: "A client wants to align their portfolio with their environmental and social values while maintaining competitive returns and proper diversification.",
    difficulty: "Advanced",
    objectives: [
      "Define ESG investment criteria",
      "Maintain portfolio diversification",
      "Monitor ESG impact and performance",
      "Balance values with returns"
    ],
    estimatedTime: "25-30 min",
    iconType: "Target"
  },
  {
    title: "Alternative Investment Integration",
    category: "Investment Planning",
    description: "A high-net-worth client interested in alternative investments needs guidance on incorporating private equity, hedge funds, and real estate into their portfolio.",
    difficulty: "Expert",
    objectives: [
      "Assess alternative investment options",
      "Evaluate liquidity constraints",
      "Structure portfolio allocation",
      "Address accreditation requirements"
    ],
    estimatedTime: "35-40 min",
    iconType: "Briefcase"
  },
  {
    title: "International Portfolio Expansion",
    category: "Investment Planning",
    description: "A client with a US-centric portfolio seeks to expand internationally, requiring guidance on global market exposure, currency risks, and emerging market opportunities.",
    difficulty: "Expert",
    objectives: [
      "Evaluate international opportunities",
      "Address currency risk",
      "Structure global diversification",
      "Consider tax implications"
    ],
    estimatedTime: "35-40 min",
    iconType: "Globe"
  },

  // Retirement Planning Scenarios
  {
    title: "Early Retirement Planning",
    category: "Retirement Planning",
    description: "A couple in their mid-30s wants to achieve financial independence and retire by age 50. They need a comprehensive strategy that balances aggressive savings with lifestyle maintenance.",
    difficulty: "Advanced",
    objectives: [
      "Calculate required retirement savings",
      "Develop sustainable withdrawal strategy",
      "Plan for healthcare costs pre-Medicare",
      "Create tax-efficient investment plan"
    ],
    estimatedTime: "30-35 min",
    iconType: "Clock"
  },
  {
    title: "Social Security Optimization",
    category: "Retirement Planning",
    description: "A married couple approaching retirement needs guidance on optimizing their Social Security benefits claiming strategy.",
    difficulty: "Intermediate",
    objectives: [
      "Compare claiming strategies",
      "Calculate breakeven scenarios",
      "Consider spousal benefits",
      "Integrate with other retirement income"
    ],
    estimatedTime: "25-30 min",
    iconType: "Calculator"
  },
  {
    title: "Late Career Catch-Up Strategy",
    category: "Retirement Planning",
    description: "A 55-year-old professional who has under-saved for retirement needs a strategy to maximize retirement savings in their remaining working years.",
    difficulty: "Advanced",
    objectives: [
      "Maximize catch-up contributions",
      "Optimize Social Security strategy",
      "Adjust investment allocation",
      "Plan for healthcare costs"
    ],
    estimatedTime: "30-35 min",
    iconType: "Target"
  },
  {
    title: "Retirement Income Portfolio Design",
    category: "Retirement Planning",
    description: "A recently retired couple needs help structuring their investment portfolio to generate reliable income while maintaining growth potential.",
    difficulty: "Advanced",
    objectives: [
      "Design income generation strategy",
      "Balance growth and stability",
      "Plan withdrawal sequence",
      "Monitor and adjust strategy"
    ],
    estimatedTime: "30-35 min",
    iconType: "PiggyBank"
  },

  // Estate Planning Scenarios
  {
    title: "Complex Family Legacy Planning",
    category: "Estate Planning",
    description: "A business owner needs help structuring their estate plan to ensure fair distribution among children (some involved in the family business, others not) while minimizing tax impact.",
    difficulty: "Expert",
    objectives: [
      "Evaluate business succession options",
      "Design equitable inheritance structure",
      "Minimize estate tax exposure",
      "Address family dynamics"
    ],
    estimatedTime: "35-40 min",
    iconType: "Users"
  },
  {
    title: "Charitable Legacy Design",
    category: "Estate Planning",
    description: "A philanthropically-minded wealthy client needs help structuring their charitable giving to maximize impact and tax efficiency while ensuring family needs are met.",
    difficulty: "Advanced",
    objectives: [
      "Structure charitable giving vehicles",
      "Optimize tax benefits",
      "Balance family and charitable goals",
      "Design governance structure"
    ],
    estimatedTime: "30-35 min",
    iconType: "Heart"
  },
  {
    title: "Blended Family Estate Strategy",
    category: "Estate Planning",
    description: "A recently remarried couple needs help structuring their estate plan to fairly provide for children from previous marriages while protecting current spouse's interests.",
    difficulty: "Expert",
    objectives: [
      "Balance competing family interests",
      "Structure inheritance timing",
      "Protect spouse's rights",
      "Minimize family conflicts"
    ],
    estimatedTime: "35-40 min",
    iconType: "Users"
  },
  {
    title: "International Estate Planning",
    category: "Estate Planning",
    description: "A client with assets in multiple countries needs help structuring their estate plan to navigate different jurisdictions and tax treaties.",
    difficulty: "Expert",
    objectives: [
      "Coordinate multiple jurisdictions",
      "Structure asset ownership",
      "Navigate tax treaties",
      "Plan document validity"
    ],
    estimatedTime: "35-40 min",
    iconType: "Globe"
  },

  // Tax Planning Scenarios
  {
    title: "Strategic Tax-Loss Harvesting",
    category: "Tax Planning",
    description: "A high-income professional needs guidance on implementing tax-loss harvesting strategies while maintaining portfolio alignment with long-term goals.",
    difficulty: "Advanced",
    objectives: [
      "Identify harvesting opportunities",
      "Navigate wash sale rules",
      "Maintain investment strategy",
      "Optimize tax efficiency"
    ],
    estimatedTime: "25-30 min",
    iconType: "DollarSign"
  },
  {
    title: "Equity Compensation Planning",
    category: "Tax Planning",
    description: "An executive with significant stock options and RSUs needs help developing an exercise and diversification strategy while managing tax implications.",
    difficulty: "Expert",
    objectives: [
      "Develop option exercise strategy",
      "Plan RSU vesting management",
      "Minimize AMT impact",
      "Create diversification timeline"
    ],
    estimatedTime: "35-40 min",
    iconType: "TrendingUp"
  },
  {
    title: "Business Sale Tax Strategy",
    category: "Tax Planning",
    description: "A business owner preparing to sell their company needs guidance on structuring the sale to minimize taxes and maximize after-tax proceeds.",
    difficulty: "Expert",
    objectives: [
      "Structure sale terms",
      "Consider installment sale options",
      "Plan for capital gains impact",
      "Evaluate charitable strategies"
    ],
    estimatedTime: "35-40 min",
    iconType: "Calculator"
  },
  {
    title: "Cryptocurrency Tax Planning",
    category: "Tax Planning",
    description: "An active cryptocurrency investor needs help managing tax implications of trading, mining, and staking activities while ensuring compliance.",
    difficulty: "Expert",
    objectives: [
      "Track transaction basis",
      "Plan mining income strategy",
      "Structure staking activities",
      "Ensure reporting compliance"
    ],
    estimatedTime: "35-40 min",
    iconType: "Bitcoin"
  },

  // Risk Management Scenarios
  {
    title: "Business Owner Protection",
    category: "Risk Management",
    description: "An entrepreneur needs a comprehensive risk management strategy covering both personal and business risks, including key person insurance and succession planning.",
    difficulty: "Expert",
    objectives: [
      "Assess business continuity risks",
      "Design insurance strategy",
      "Plan business succession",
      "Protect personal assets"
    ],
    estimatedTime: "35-40 min",
    iconType: "Shield"
  },
  {
    title: "Long-Term Care Planning",
    category: "Risk Management",
    description: "A couple in their 50s needs to develop a strategy for potential long-term care needs while balancing other financial objectives.",
    difficulty: "Intermediate",
    objectives: [
      "Compare insurance options",
      "Evaluate self-funding capability",
      "Consider hybrid products",
      "Plan for spouse protection"
    ],
    estimatedTime: "25-30 min",
    iconType: "Heart"
  },
  {
    title: "Executive Benefits Optimization",
    category: "Risk Management",
    description: "A corporate executive needs help maximizing their benefits package, including stock options, deferred compensation, and supplemental insurance.",
    difficulty: "Expert",
    objectives: [
      "Optimize benefit elections",
      "Plan deferred comp strategy",
      "Structure option exercises",
      "Coordinate insurance coverage"
    ],
    estimatedTime: "35-40 min",
    iconType: "Award"
  },
  {
    title: "Pre-Retirement Risk Transition",
    category: "Risk Management",
    description: "A client five years from retirement needs to adjust their risk management strategy to protect their accumulated wealth while maintaining growth potential.",
    difficulty: "Advanced",
    objectives: [
      "Assess current risk exposure",
      "Design transition strategy",
      "Protect accumulated wealth",
      "Maintain growth potential"
    ],
    estimatedTime: "30-35 min",
    iconType: "Shield"
  }
];

// @desc    Get all scenarios
// @route   GET /api/scenarios
// @access  Private
const getScenarios = async (req, res) => {
  try {
    console.log('Fetching scenarios...');
    
    // If user is admin, return all scenarios
    if (req.user.isAdmin) {
      let scenarios = await Scenario.find({ isActive: true })
        .sort({ category: 1, difficulty: 1 });
      
      if (scenarios.length === 0) {
        console.log('No scenarios found, seeding with defaults...');
        scenarios = await Scenario.insertMany(
          defaultScenarios.map(scenario => ({
            ...scenario,
            createdBy: req.user._id,
            isActive: true
          }))
        );
        console.log(`Created ${scenarios.length} default scenarios`);
      }

      return res.json(scenarios);
    }

    // For trainees, only return assigned scenarios
    const assignments = await ScenarioAssignment.find({
      userId: req.user._id,
      status: 'active'
    }).populate('scenarioId');

    // Extract scenarios from assignments and filter out any null values
    const scenarios = assignments
      .map(assignment => assignment.scenarioId)
      .filter(scenario => scenario && scenario.isActive);

    console.log(`Returning ${scenarios.length} assigned scenarios for trainee ${req.user._id}`);
    res.json(scenarios);

  } catch (error) {
    console.error('Error in getScenarios:', error);
    res.status(500).json({ message: 'Error fetching scenarios' });
  }
};

// @desc    Create new scenario
// @route   POST /api/scenarios
// @access  Private/Admin
const createScenario = async (req, res) => {
  try {
    console.log('Creating new scenario:', req.body);
    const scenario = new Scenario({
      ...req.body,
      createdBy: req.user._id
    });
    
    const savedScenario = await scenario.save();
    console.log('Created scenario:', savedScenario);
    res.status(201).json(savedScenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update scenario
// @route   PUT /api/scenarios/:id
// @access  Private/Admin
const updateScenario = async (req, res) => {
  try {
    console.log('Updating scenario:', req.params.id);
    const scenario = await Scenario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    console.log('Updated scenario:', scenario);
    res.json(scenario);
  } catch (error) {
    console.error('Error updating scenario:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete scenario
// @route   DELETE /api/scenarios/:id
// @access  Private/Admin
const deleteScenario = async (req, res) => {
  try {
    console.log('Deleting scenario:', req.params.id);
    const scenario = await Scenario.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    console.log('Deleted scenario:', scenario._id);
    res.json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reset scenarios to defaults
// @route   POST /api/scenarios/reset
// @access  Private/Admin
const resetScenarios = async (req, res) => {
  try {
    console.log('Starting scenarios reset...');
    
    // Delete all existing scenarios
    await Scenario.deleteMany({});
    console.log('Deleted existing scenarios');
    
    // Create default scenarios
    const scenarios = await Scenario.insertMany(
      defaultScenarios.map(scenario => ({
        ...scenario,
        createdBy: req.user._id,
        isActive: true
      }))
    );
    
    console.log(`Created ${scenarios.length} new scenarios`);
    
    res.status(200).json({ 
      message: 'Database reset successful',
      scenarios 
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Failed to reset database' });
  }
};

module.exports = {
  getScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  resetScenarios,
  defaultScenarios
};