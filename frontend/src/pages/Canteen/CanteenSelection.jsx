import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentTopNav from '../../components/StudentTopNav';

const CanteenSelection = () => {
  const navigate = useNavigate();

  
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

  // Color variants per canteen
  const accentVariants = [
    { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', hoverBorder: 'hover:border-primary' },
    { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', hoverBorder: 'hover:border-primary' },
    { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', hoverBorder: 'hover:border-primary' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <StudentTopNav active="Canteen" />

      {/* ═══ HEADER ═══ */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">SLIIT Dining Services</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                Select Your{' '}
                <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Dining Spot</span>
              </h1>
              <p className="text-white/70 text-sm mt-1">Skip the queue. Pre-order meals from SLIIT's top food outlets in seconds.</p>
            </div>
            <button
              onClick={() => navigate('/my-orders')}
              className="px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-sm shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>

      {/* ═══ CANTEEN CARDS ═══ */}
      <div className="max-w-6xl mx-auto px-6 mt-8 pb-10 w-full">
        <p className="text-xs text-primary uppercase tracking-widest font-bold mb-3">Available Outlets</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {canteens.map((canteen, index) => {
            const variant = accentVariants[index % accentVariants.length];
            return (
              <div
                key={canteen.id}
                onClick={() => handleSelect(canteen.name)}
                className={`group bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden cursor-pointer ${variant.hoverBorder} transition-all duration-300 flex flex-col hover:shadow-md`}
              >
                {/* Top accent stripe + logo area */}
                <div className="relative flex-shrink-0 bg-slate-50 border-b border-slate-200 flex items-center justify-center p-8">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary/40 rounded-b-full" />
                  <div className={`w-20 h-20 ${variant.bg} rounded-2xl flex items-center justify-center border ${variant.border} transform group-hover:scale-110 transition-all duration-500`}>
                    <img
                      src={canteen.logo}
                      alt={canteen.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/1377/1377194.png'; }}
                    />
                  </div>
                </div>

                {/* Content area */}
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${variant.text} ${variant.bg} border ${variant.border} px-2.5 py-0.5 rounded-lg`}>
                      {canteen.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">#{String(canteen.id).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {canteen.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1.5">
                    {canteen.desc}
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2.5 mt-auto pt-5">
                    <button className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 bg-accent text-white shadow-[0_0_20px_rgba(255,107,53,0.25)] hover:opacity-90">
                      View Menu
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/canteen-reviews?canteen=${encodeURIComponent(canteen.name)}`); }}
                      className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all duration-300 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      Reviews
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm font-medium">
            Powered by SLIIT Smart University Portal © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CanteenSelection;