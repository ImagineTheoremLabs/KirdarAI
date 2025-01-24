import React from 'react';
import HeroSection from './HeroSection';
import { 
  Users, 
  Target, 
  Award,
  Zap,
  BrainCircuit,
  LineChart,
  MessageSquare,
  Workflow
} from 'lucide-react';
import { FeatureCard, StatsCard, TestimonialCard } from './HomeComponents';

const HomePage = () => {
  const stats = [
    { value: "1000+", label: "Active Users", icon: Users, delay: 0.2 },
    { value: "50+", label: "Training Scenarios", icon: Target, delay: 0.4 },
    { value: "95%", label: "Success Rate", icon: Award, delay: 0.6 },
    { value: "24/7", label: "AI Support", icon: Zap, delay: 0.8 }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: "Dynamic Client Personas",
      description: "Engage with AI-powered personas that adapt to your communication style and provide realistic client interactions.",
      delay: 0.3
    },
    {
      icon: BrainCircuit,
      title: "Smart Feedback System",
      description: "Get instant, personalized insights on your advisory approach with our advanced AI analysis engine.",
      delay: 0.5
    },
    {
      icon: LineChart,
      title: "Performance Analytics",
      description: "Track your progress with comprehensive metrics and detailed insights for continuous improvement.",
      delay: 0.7
    },
    {
      icon: Workflow,
      title: "Scenario Library",
      description: "Access a growing collection of real-world scenarios covering various client situations and investment challenges.",
      delay: 0.9
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior Financial Advisor",
      content: "Kirdar.ai has revolutionized my client preparation. The AI personas are incredibly realistic and help me anticipate client concerns before they arise.",
      delay: 0.4
    },
    {
      name: "Michael Chen",
      role: "Wealth Management Director",
      content: "The instant feedback and detailed analytics have accelerated my team's professional development. An invaluable tool for modern financial advisors.",
      delay: 0.6
    },
    {
      name: "Emma Davis",
      role: "Investment Strategist",
      content: "This platform has become an essential part of our training program. The diverse scenario library and real-time feedback are game-changers.",
      delay: 0.8
    }
  ];

  const renderSection = (title, subtitle, children) => (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.03),rgba(0,0,0,0))]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-4">
            {title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <HeroSection />

      {renderSection(
        "Empowering Financial Advisors",
        "Join thousands of professionals using Kirdar.ai to enhance their advisory skills",
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      )}

      {renderSection(
        "Cutting-Edge Features",
        "Advanced tools designed to elevate your advisory practice",
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      )}

      {renderSection(
        "Success Stories",
        "Hear from financial advisors who have transformed their practice with Kirdar.ai",
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      )}

      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Transform</span> Your Practice?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join the growing community of financial advisors who are leveraging AI to enhance their client interactions.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full text-white font-medium hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300 transform hover:scale-105">
            Start Your Free Trial
          </button>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
    </div>
  );
};

export default HomePage;