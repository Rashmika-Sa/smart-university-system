import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentTopNav from '../../components/StudentTopNav';

const CanteenSelection = () => {
  const navigate = useNavigate();

  // 🏪 Canteen Data Configuration (Barista Removed!)
  const canteens = [
    { 
      id: 1,
      name: 'Main Canteen', 
      logo: 'https://cdn-icons-png.flaticon.com/512/3274/3274099.png', 
      desc: 'Authentic Sri Lankan Rice & Curry, Fried Rice, and budget-friendly meals.',
      category: 'Student Favorite',
    },
    { 
      id: 2,
      name: 'Birdnest Canteen', 
      logo: 'https://cdn-icons-png.flaticon.com/512/2819/2819194.png', 
      desc: 'Fresh fruit juices, healthy salads, sandwiches, and light snacks.',
      category: 'Healthy Choice',
    },
    { 
      id: 3,
      name: 'Perera & Sons (P&S)', 
      logo: 'https://seeklogo.com/images/P/perera-and-sons-logo-858807C275-seeklogo.com.png', 
      desc: 'Short eats, pastries, cakes, and quick bites from a trusted brand.',
      category: 'Quick Bites',
    }
  ];

  const handleSelect = (canteenName) => {
    navigate(`/canteen-menu/${encodeURIComponent(canteenName)}`);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col p-6 relative overflow-hidden font-sans text-gray-800">
      <StudentTopNav active="Canteen" />
      
      {/* 🏛️ SLIIT Themed Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-primary-dark rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* 🚀 Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto mt-8">
        
        {/* Header Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-white/70 border border-white/60 shadow-sm backdrop-blur">
            <span className="text-accent font-bold text-xs tracking-widest uppercase">SLIIT Dining Services</span>
          </div>
            
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary tracking-tight mb-4">
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">Dining Spot</span>
          </h1>
            
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Skip the queue. Pre-order meals from SLIIT's top food outlets in seconds.
          </p>
        </div>

        {/* 🍱 Cards Grid - 👇 Changed to md:grid-cols-3 to perfectly balance the 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {canteens.map((canteen, index) => (
            <div 
              key={canteen.id}
              onClick={() => handleSelect(canteen.name)}
              className="group relative bg-white/95 h-[420px] rounded-3xl shadow-lg border border-white/70 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-accent/50 transition-all duration-500 hover:-translate-y-2 flex flex-col animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }} // Staggered entrance
            >
              
              {/* Card Header / Image Area */}
              <div className="h-40 bg-secondary relative flex items-center justify-center group-hover:bg-primary/5 transition-colors duration-500 border-b border-gray-100 overflow-hidden">
                {/* Floating Logo */}
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 transform group-hover:scale-110 group-hover:border-accent transition-all duration-500 relative z-10">
                    <img 
                        src={canteen.logo} 
                        alt={canteen.name} 
                        className="w-14 h-14 object-contain"
                        onError={(e) => {e.target.src = 'https://cdn-icons-png.flaticon.com/512/1377/1377194.png'}}
                    />
                </div>
                
                {/* Background Pattern using Tailwind */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-dark to-transparent background-size-[16px_16px]"></div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col items-center text-center">
                
                {/* Category Tag */}
                <span className="text-[10px] font-bold tracking-wider uppercase text-primary bg-accent/10 px-3 py-1 rounded-full mb-3">
                    {canteen.category}
                </span>

                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-primary-dark transition-colors">
                  {canteen.name}
                </h3>
                
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {canteen.desc}
                </p>

                {/* Bottom Action Area */}
                <div className="mt-auto w-full space-y-2">
                    <button className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-white border border-gray-200 text-gray-600 shadow-sm group-hover:bg-accent group-hover:text-white group-hover:border-transparent group-hover:shadow-lg">
                        View Menu
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/canteen-reviews?canteen=${encodeURIComponent(canteen.name)}`); }}
                      className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all duration-300 bg-white border border-gray-200 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      See Reviews
                    </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12 animate-in fade-in duration-1000 delay-500">
            <p className="text-slate-400 text-sm font-medium">
                Powered by Sliit Smart Uni © {new Date().getFullYear()}
            </p>
        </div>

      </div>
    </div>
  );
};

export default CanteenSelection;