// seeds/personaSeeds.js
const defaultPersonas = [
    {
      name: "Investment Advisor Client",
      age: 45,
      income: "$120,000/year",
      portfolio: "$250,000",
      riskTolerance: "Moderate",
      goals: "Growing wealth for retirement while managing risk",
      concerns: "Market volatility, ensuring proper diversification",
      knowledgeLevel: "Basic understanding of investments",
      isActive: true
    },
    {
      name: "Early Retirement Planning Client",
      age: 35,
      income: "$150,000/year",
      portfolio: "$200,000 in 401(k)",
      riskTolerance: "Moderate-High",
      goals: "Achieve financial independence, retire by 50",
      concerns: "Having enough savings, healthcare costs before Medicare",
      knowledgeLevel: "Moderate understanding of retirement planning",
      isActive: true
    },
    {
      name: "Estate Planning Client",
      age: 60,
      income: "Net Worth: $2.5 million",
      portfolio: "Mix of real estate, investments, and business interests",
      riskTolerance: "Low",
      goals: "Efficient wealth transfer, minimizing tax impact",
      concerns: "Fair distribution among children, tax implications",
      knowledgeLevel: "Limited understanding of estate planning",
      isActive: true
    }
  ];
  
  module.exports = defaultPersonas;