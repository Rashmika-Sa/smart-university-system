import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div 
      className="min-h-screen flex flex-col text-white relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop')", 
      }}
    >
      {/* 👇 FIX: Changed bg-primary-dark/80 to bg-black/60 to remove the blue but keep text readable */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* --- HERO SECTION --- */}
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="mb-6 inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md animate-fade-in-down">
            <span className="text-white text-xs font-bold tracking-widest uppercase">
              🚀 The Future of Campus Life
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
            Sliit Smart Uni <br />
            <span className="text-4xl md:text-6xl text-white">System</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-gray-300 mb-10 leading-relaxed drop-shadow-md">
            Experience a seamless campus environment. Order food, track shuttles, 
            borrow books, and manage facilities—all from one futuristic dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/login" 
              className="px-8 py-4 rounded-xl bg-primary hover:bg-accent text-white font-semibold transition-all duration-300 shadow-lg shadow-primary-dark/40 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Student Login</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </Link>
            
            <Link 
              to="/register" 
              className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/20 text-white font-semibold backdrop-blur-md transition-all duration-300 flex items-center justify-center"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* --- FEATURE GRID --- */}
        <div className="px-6 py-8 max-w-7xl mx-auto w-full mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon="🍔" 
              title="Smart Canteen" 
              desc="Pre-order meals instantly." 
              color="from-orange-400 to-red-500"
            />
            <FeatureCard 
              icon="🚌" 
              title="Shuttle Tracker" 
              desc="Real-time bus locations." 
              color="from-blue-400 to-indigo-500"
            />
            <FeatureCard 
              icon="📚" 
              title="Academic Spaces" 
              desc="Reserve books & rooms." 
              color="from-green-400 to-emerald-500"
            />
            <FeatureCard 
              icon="🏟️" 
              title="Facility Booking" 
              desc="Book sports grounds." 
              color="from-purple-400 to-pink-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="group relative p-6 h-full rounded-2xl bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/20 backdrop-blur-md flex flex-col items-center text-center overflow-hidden">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 rounded-2xl bg-gradient-to-br ${color} transition-opacity duration-500`}></div>
    <div className="relative z-10">
      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{title}</h3>
      <p className="text-gray-200 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Home;