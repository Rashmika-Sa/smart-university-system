import React from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mini Calendar Component ---
const CalendarWidget = () => {
  const date = new Date();
  const currentDay = date.getDate();
  const currentMonth = date.toLocaleString('default', { month: 'long' });
  const currentYear = date.getFullYear();

  // Generate days for a simple view
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 w-full max-w-xs ml-auto shadow-[0_0_15px_rgba(59,130,246,0.2)]">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-3 border-b border-blue-500/20 pb-2">
        <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">
          {currentMonth} {currentYear}
        </span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="font-bold text-blue-600 mb-1">{d}</div>
        ))}
        
        {/* Empty slots for visual alignment */}
        <div className="col-span-2"></div>

        {/* Render Days */}
        {days.map((d) => (
          <div 
            key={d} 
            className={`
              p-1 rounded-md transition-all cursor-default
              ${d === currentDay 
                ? 'bg-orange-600 text-white font-bold shadow-[0_0_10px_rgba(249,115,22,0.6)]' 
                : 'hover:bg-blue-500/20 hover:text-blue-300'}
            `}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0f172a] text-white font-sans">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>

      {/* --- Main Content --- */}
      <div className="flex-grow flex flex-col items-center justify-center pt-20 pb-12 px-6">
        <div className="max-w-6xl w-full text-center z-10">
          
          {/* Futuristic Badge */}
          <div className="mb-8 flex justify-center">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-blue-400 text-sm font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
              System Online • v2.0
            </span>
          </div>
          
          {/* Hero Title */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">
            SLIIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">PORTAL</span>
          </h1>
          
          {/* Animated Description */}
          <div className="overflow-hidden mb-12 max-w-2xl mx-auto">
            <p className="text-xl text-gray-400 font-light leading-relaxed animate-slide-right">
              Next-generation campus management. Access reservations, labs, and schedules through a secure, encrypted neural network.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-24">
            <button 
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.8)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Initialize Login</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white/5 backdrop-blur-lg border border-white/10 text-white text-lg font-bold rounded-xl hover:bg-white/10 hover:border-orange-500 hover:text-orange-500 transition-all duration-300 cursor-pointer"
            >
              New Access Key
            </button>
          </div>

          {/* Glass Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
             {/* Card 1 */}
             <div className="group bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-400 text-3xl group-hover:scale-110 transition-transform shadow-inner shadow-blue-500/30">📅</div>
                <h3 className="font-bold text-xl text-white mb-4">Quantum Scheduling</h3>
                <div className="w-full overflow-hidden mask-linear-fade">
                  <div className="animate-scroll">
                    <span className="text-gray-400 text-sm mx-4 whitespace-nowrap">Real-time lab allocation • Instant Availability • Zero Latency Sync</span>
                    <span className="text-gray-400 text-sm mx-4 whitespace-nowrap">Real-time lab allocation • Instant Availability • Zero Latency Sync</span>
                  </div>
                </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 text-orange-400 text-3xl group-hover:scale-110 transition-transform shadow-inner shadow-orange-500/30">🛡️</div>
                <h3 className="font-bold text-xl text-white mb-4">Encrypted Vault</h3>
                <div className="w-full overflow-hidden mask-linear-fade">
                  <div className="animate-scroll">
                    <span className="text-gray-400 text-sm mx-4 whitespace-nowrap">Biometric-grade security • End-to-End Encryption • GDPR Compliant</span>
                    <span className="text-gray-400 text-sm mx-4 whitespace-nowrap">Biometric-grade security • End-to-End Encryption • GDPR Compliant</span>
                  </div>
                </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 text-purple-400 text-3xl group-hover:scale-110 transition-transform shadow-inner shadow-purple-500/30">🚀</div>
                <h3 className="font-bold text-xl text-white mb-4">Warp Speed</h3>
                <div className="w-full overflow-hidden mask-linear-fade">
                  <div className="animate-scroll">
                    <span className="text-gray-400 text-sm mx-4 whitespace-nowrap">Optimized Core • 99.9% Uptime • Instant Data Retrieval</span>
                    <span className="text-gray-400 text-sm mx-4 whitespace-nowrap">Optimized Core • 99.9% Uptime • Instant Data Retrieval</span>
                  </div>
                </div>
            </div>

          </div>

        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="w-full bg-white/5 backdrop-blur-lg border-t border-white/10 pt-10 pb-8 z-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side: SLIIT Support Info */}
          <div className="text-center md:text-left space-y-5">
            <div>
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">
                Do you need any <br />
                <span className="text-orange-500">SUPPORT ?</span>
              </h3>
            </div>
            
            {/* Contact Details */}
            <div className="flex flex-col md:items-start items-center space-y-2 text-blue-200">
              <a href="https://support.sliit.lk" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-white transition-colors">
                <span>🌐</span>
                <span className="font-mono text-lg">support.sliit.lk</span>
              </a>
              <a href="tel:+94117544801" className="flex items-center space-x-2 hover:text-white transition-colors">
                <span>📞</span>
                <span className="font-mono text-lg">+94 11 754 4801</span>
              </a>
            </div>

            {/* Feedback Button */}
            <button className="mt-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 mx-auto md:mx-0">
              <span>💬</span>
              Provide Feedback to SLIIT
            </button>
          </div>

          {/* Right Side: Holographic Calendar */}
          <div className="flex justify-center md:justify-end">
            <CalendarWidget />
          </div>

        </div>
      </footer>
      
    </div>
  );
};

export default Home;