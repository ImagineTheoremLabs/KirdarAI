import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, User, Bot, Shield, Target, Briefcase } from 'lucide-react';

const FloatingCard = ({ delay, children, position }) => (
  <div
    className={`absolute ${position} bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-6 rounded-2xl backdrop-blur-xl 
    border border-sky-500/10 shadow-2xl transform transition-all duration-700 animate-float-card w-64`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

const ChatMessage = ({ isAI, message, delay }) => (
  <div
    className={`flex items-start gap-3 ${isAI ? 'flex-row' : 'flex-row-reverse'} 
    animate-slide-in opacity-0`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className={`rounded-full p-3 ${isAI ? 'bg-sky-500/20' : 'bg-blue-500/20'}`}>
      {isAI ? 
        <Bot size={24} className="text-sky-400" /> : 
        <User size={24} className="text-blue-400" />
      }
    </div>
    <div className={`${isAI ? 'bg-gray-900/60' : 'bg-gray-800/60'} 
      p-4 rounded-2xl backdrop-blur-sm border border-sky-500/10 max-w-xs`}>
      <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
    </div>
  </div>
);

const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center gap-3 text-center p-4 animate-fade-in-up">
    <div className="rounded-full bg-sky-500/10 p-4 mb-2">
      <Icon size={24} className="text-sky-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1),rgba(4,6,12,1))]" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow-delayed" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Additional light effects */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block animate-bounce-slow">
              <div className="relative">
                <MessageCircle size={48} className="text-sky-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
              <span className="inline-block">
                <span className="inline-block bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
                  Kirdar.ai
                </span>
              </span>
              <br />
              <span className="inline-block mt-2 text-3xl md:text-4xl text-gray-300">
                Master the Art of Advisory
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto animate-fade-in-up delay-200">
              Train with AI personas to perfect your client interactions and elevate your financial advisory practice
            </p>
          </div>

          {/* Chat Demo Section */}
          <div className="relative h-96 mb-16">
            {/* Conversation Flow */}
            <div className="absolute inset-0 flex flex-col gap-6 max-w-lg mx-auto">
              <ChatMessage 
                isAI={true}
                message="I'm worried about market volatility affecting my retirement plans. What strategies would you recommend?"
                delay={0.5}
              />
              <ChatMessage 
                isAI={false}
                message="Let's analyze your risk tolerance and create a diversified portfolio that aligns with your long-term goals."
                delay={1.5}
              />
              <ChatMessage 
                isAI={true}
                message="That sounds good. Can you explain how diversification would help protect my investments?"
                delay={2.5}
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Feature 
              icon={Shield}
              title="Risk-Free Practice"
              description="Train with AI personas without the pressure of real client interactions"
            />
            <Feature 
              icon={Target}
              title="Instant Feedback"
              description="Receive real-time analysis of your advisory approach and communication style"
            />
            <Feature 
              icon={Briefcase}
              title="Diverse Scenarios"
              description="Practice handling various client personalities and investment situations"
            />
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/questionnaire')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-sky-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                Begin Your Training
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes float-card {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }

        @keyframes slide-in {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes fade-in-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float-card {
          animation: float-card 6s ease-in-out infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .animate-pulse-slow {
          animation: pulse 6s ease-in-out infinite;
        }

        .animate-pulse-slow-delayed {
          animation: pulse 6s ease-in-out infinite;
          animation-delay: 3s;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;