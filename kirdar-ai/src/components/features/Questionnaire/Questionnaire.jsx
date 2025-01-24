// src/components/features/Questionnaire/Questionnaire.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FormSection = ({ title, children }) => (
  <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 mb-8">
    <h2 className="text-2xl font-semibold text-sky-400 mb-6">{title}</h2>
    {children}
  </div>
);

const FormGroup = ({ label, children }) => (
  <div className="mb-6">
    <label className="block text-gray-300 mb-2 font-medium">{label}</label>
    {children}
  </div>
);

const RadioGroup = ({ options, name, onChange }) => (
  <div className="flex flex-wrap gap-4">
    {options.map((option) => (
      <label key={option} className="flex items-center bg-gray-800/50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors duration-200">
        <input
          type="radio"
          name={name}
          value={option}
          onChange={onChange}
          className="mr-2 accent-sky-500"
        />
        <span className="text-gray-300">{option}</span>
      </label>
    ))}
  </div>
);

const CheckboxGroup = ({ options, onChange }) => (
  <div className="flex flex-wrap gap-4">
    {options.map((option) => (
      <label key={option} className="flex items-center bg-gray-800/50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors duration-200">
        <input
          type="checkbox"
          value={option}
          onChange={onChange}
          className="mr-2 accent-sky-500"
        />
        <span className="text-gray-300">{option}</span>
      </label>
    ))}
  </div>
);

const Slider = ({ min, max, value, onChange }) => (
  <div className="flex items-center gap-4">
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
    />
    <span className="bg-gray-800 px-3 py-1 rounded-md text-gray-300 min-w-[3rem] text-center">
      {value}
    </span>
  </div>
);

const Questionnaire = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    experience: '',
    clientTypes: [],
    confidenceScores: {
      savingsStrategies: 3,
      investmentOptions: 3,
      socialSecurity: 3,
      healthcare: 3,
      taxPlanning: 3
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    navigate('/client-personas');
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-8">
          Financial Advisory Questionnaire
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <FormSection title="Personal Information">
            <FormGroup label="Name">
              <input
                type="text"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-sky-500"
                placeholder="Your name"
              />
            </FormGroup>

            <FormGroup label="Email">
              <input
                type="email"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-sky-500"
                placeholder="Your email"
              />
            </FormGroup>

            <FormGroup label="Years of Experience in Financial Advisory">
              <RadioGroup
                name="experience"
                options={['Less than 1 year', '1-3 years', '4-7 years', '8+ years']}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </FormGroup>
          </FormSection>

          {/* Client Engagement */}
          <FormSection title="Client Engagement">
            <FormGroup label="How often do you advise clients on retirement planning?">
              <RadioGroup
                name="frequency"
                options={['Frequently', 'Occasionally', 'Rarely', 'Never']}
                onChange={(e) => {}}
              />
            </FormGroup>

            <FormGroup label="Which types of clients do you primarily work with? (Select all that apply)">
              <CheckboxGroup
                options={[
                  'High-income earners',
                  'Business owners',
                  'Middle-income earners',
                  'Individuals nearing retirement',
                  'Young professionals'
                ]}
                onChange={(e) => {
                  const value = e.target.value;
                  const clientTypes = formData.clientTypes.includes(value)
                    ? formData.clientTypes.filter(type => type !== value)
                    : [...formData.clientTypes, value];
                  setFormData({ ...formData, clientTypes });
                }}
              />
            </FormGroup>
          </FormSection>

          {/* Retirement Planning Knowledge */}
          <FormSection title="Retirement Planning Knowledge">
            <FormGroup label="How confident are you in your knowledge of retirement savings strategies?">
              <Slider
                min={1}
                max={5}
                value={formData.confidenceScores.savingsStrategies}
                onChange={(e) => setFormData({
                  ...formData,
                  confidenceScores: {
                    ...formData.confidenceScores,
                    savingsStrategies: e.target.value
                  }
                })}
              />
            </FormGroup>

            <FormGroup label="Rate your understanding of investment options for retirement">
              <Slider
                min={1}
                max={5}
                value={formData.confidenceScores.investmentOptions}
                onChange={(e) => setFormData({
                  ...formData,
                  confidenceScores: {
                    ...formData.confidenceScores,
                    investmentOptions: e.target.value
                  }
                })}
              />
            </FormGroup>

            <FormGroup label="How well do you understand Social Security benefits?">
              <Slider
                min={1}
                max={5}
                value={formData.confidenceScores.socialSecurity}
                onChange={(e) => setFormData({
                  ...formData,
                  confidenceScores: {
                    ...formData.confidenceScores,
                    socialSecurity: e.target.value
                  }
                })}
              />
            </FormGroup>
          </FormSection>

          {/* Training Goals */}
          <FormSection title="Training Goals">
            <FormGroup label="What are your primary goals for using the Simulator? (Select all that apply)">
              <CheckboxGroup
                options={[
                  'Improve overall knowledge of retirement planning',
                  'Enhance client engagement techniques',
                  'Practice handling different client scenarios',
                  'Gain confidence in providing retirement advice',
                  'Learn advanced retirement strategies'
                ]}
                onChange={(e) => {}}
              />
            </FormGroup>
          </FormSection>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-sky-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Submit Questionnaire
          </button>
        </form>
      </div>
    </div>
  );
};

export default Questionnaire;