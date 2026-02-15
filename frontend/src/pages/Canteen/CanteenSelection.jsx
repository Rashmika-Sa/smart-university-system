import React from 'react';
import { useNavigate } from 'react-router-dom';

const CanteenSelection = () => {
  const navigate = useNavigate();

  // 🏪 Canteen Data Configuration
  const canteens = [
    { 
      id: 1,
      name: 'Main Canteen', 
      logo: 'https://cdn-icons-png.flaticon.com/512/3274/3274099.png', // 🍛 Rice Icon
      desc: 'Authentic Sri Lankan Rice & Curry, Fried Rice, and budget-friendly meals.',
      category: 'Student Favorite',
    },
    { 
      id: 2,
      name: 'Birdnest Canteen', 
      logo: 'https://cdn-icons-png.flaticon.com/512/2819/2819194.png', // 🥗 Salad/Fresh Icon
      desc: 'Fresh fruit juices, healthy salads, sandwiches, and light snacks.',
      category: 'Healthy Choice',
    },
    { 
      id: 3,
      name: 'Perera & Sons (P&S)', 
      logo: 'https://seeklogo.com/images/P/perera-and-sons-logo-858807C275-seeklogo.com.png', // 🥪 P&S Logo
      desc: 'Short eats, pastries, cakes, and quick bites from a trusted brand.',
      category: 'Quick Bites',
    },
    { 
      id: 4,
      name: 'Barista', 
      logo: 'https://cdn-icons-png.flaticon.com/512/751/751621.png', // ☕ Coffee Icon
      desc: 'Premium coffee, espresso, brownies, and café style ambiance.',
      category: 'Premium Café',
    },
  ];

  const handleSelect = (canteenName) => {
    navigate(`/canteen-menu/${encodeURIComponent(canteenName)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* 🏛️ SLIIT Themed Background Elements */}
      {/* Deep Navy Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#002147] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      {/* Gold/Amber Blob */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      {/* Bottom Navy Blob */}
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* 🚀 Content Container */}
      <div className="relative z-10 max-w-7xl w-full">
        
        {/* Header Section */}
        <div className="text-center mb-16">
            {/* Pill Badge */}
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[#002147] border border-blue-900 shadow-sm">
                <span className="text-amber-400 font-bold text-xs tracking-widest uppercase">SLIIT Dining Services</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#002147] tracking-tight mb-4">
                Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Dining Spot</span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Skip the queue. Pre-order your meals from SLIIT's top food outlets directly from your device.
            </p>
        </div>

        {/* 🍱 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {canteens.map((canteen) => (
            <div 
              key={canteen.id}
              onClick={() => handleSelect(canteen.name)}
              className="group relative bg-white h-[420px] rounded-3xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-amber-200 transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              
              {/* Card Header / Image Area */}
              <div className="h-40 bg-slate-50 relative flex items-center justify-center group-hover:bg-[#002147]/5 transition-colors duration-500">
                {/* Floating Logo */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white transform group-hover:scale-110 group-hover:border-amber-400 transition-all duration-500 relative z-10">
                    <img 
                        src={canteen.logo} 
                        alt={canteen.name} 
                        className="w-14 h-14 object-contain"
                        onError={(e) => {e.target.src = 'https://cdn-icons-png.flaticon.com/512/1377/1377194.png'}}
                    />
                </div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#002147_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col items-center text-center">
                
                {/* Category Tag - Updated to Navy Text on Gold Background */}
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#002147] bg-amber-100 px-3 py-1 rounded-full mb-3">
                    {canteen.category}
                </span>

                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#002147] transition-colors">
                  {canteen.name}
                </h3>
                
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {canteen.desc}
                </p>

                {/* Bottom Action Area */}
                <div className="mt-auto w-full">
                    <button className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300
                        bg-white border border-slate-200 text-slate-600 shadow-sm
                        group-hover:bg-[#002147] group-hover:text-white group-hover:border-transparent group-hover:shadow-lg"
                    >
                        View Menu
                    </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12">
            <p className="text-slate-400 text-sm">
                Powered by SLIIT Smart University System © {new Date().getFullYear()}
            </p>
        </div>

      </div>
    </div>
  );
};

export default CanteenSelection;