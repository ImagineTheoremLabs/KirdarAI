import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    const endValue = parseInt(value.replace(/\D/g, ''));
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;
      
      if (progress < 1) {
        setCount(Math.floor(endValue * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{count.toLocaleString()}{value.includes('+') ? '+' : ''}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative group bg-gray-900/50 p-8 rounded-2xl border border-sky-500/10 backdrop-blur-sm transition-all duration-500 hover:border-sky-500/30"
      style={{
        animation: `fadeInUp 0.5s ease-out ${delay}s both`,
        transform: isHovered ? 'translateY(-8px)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-sky-600/0 via-sky-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      <div className="relative">
        <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-2xl transform group-hover:scale-110 transition-transform duration-500" />
        <div className="relative text-sky-400 mb-6 transform transition-transform duration-500 group-hover:scale-110">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-sky-400 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const StatsCard = ({ value, label, icon: Icon, delay = 0 }) => (
  <div 
    className="relative overflow-hidden bg-gray-900/50 p-6 rounded-2xl border border-sky-500/10 backdrop-blur-sm hover:border-sky-500/30 transition-all duration-500 transform hover:-translate-y-1"
    style={{
      animation: `fadeInUp 0.5s ease-out ${delay}s both`
    }}
  >
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-blue-500/20 animate-pulse-slow" 
           style={{ transform: 'skewY(-20deg)' }} />
    </div>

    <div className="relative flex items-center gap-4">
      <div className="p-3 bg-sky-500/10 rounded-xl backdrop-blur-sm group-hover:bg-sky-500/20 transition-colors duration-300">
        <Icon className="w-6 h-6 text-sky-400" />
      </div>
      <div>
        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          <AnimatedCounter value={value} />
        </div>
        <div className="text-gray-400 text-sm mt-1">{label}</div>
      </div>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, content, image, delay = 0 }) => (
  <div 
    className="bg-gray-900/50 p-8 rounded-2xl border border-sky-500/10 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/30 transform hover:-translate-y-1"
    style={{
      animation: `fadeInUp 0.5s ease-out ${delay}s both`
    }}
  >
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-md animate-pulse-slow" />
          <img 
            src={image || "/api/placeholder/64/64"} 
            alt={name} 
            className="w-12 h-12 rounded-full bg-gray-800 relative z-10"
          />
        </div>
      </div>
      <div>
        <div className="mb-4 flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-sky-400" />
          ))}
        </div>
        <p className="text-gray-300 mb-4 leading-relaxed">{content}</p>
        <div>
          <p className="font-semibold text-sky-400">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  </div>
);

export { AnimatedCounter, FeatureCard, StatsCard, TestimonialCard };