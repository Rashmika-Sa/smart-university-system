import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // --- Calendar Logic ---
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Friday"
  const fullDate = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }); // e.g. "13 February 2026"
  
  // Generate current week days
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Adjust so Monday is 0

  return (
    <div 
      className="min-h-screen flex flex-col text-white relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop')", 
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* --- HERO SECTION --- */}
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="mb-6 inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md animate-fade-in-down">
            <span className="text-blue-300 text-xs font-bold tracking-widest uppercase">
              🚀 The Future of Campus Life
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
            Smart University <br />
            <span className="text-4xl md:text-6xl text-white">System</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-gray-300 mb-10 leading-relaxed drop-shadow-md">
            Experience a seamless campus environment. Order food, track shuttles, 
            borrow books, and manage facilities—all from one futuristic dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/login" 
              className="px-8 py-4 rounded-xl bg-[#002c5f] hover:bg-[#003e85] text-white font-semibold transition-all duration-300 shadow-lg shadow-blue-900/40 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Student Login</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </Link>
            
            <Link 
              to="/register" 
              className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold backdrop-blur-md transition-all duration-300 flex items-center justify-center"
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
            
            {/* --- STATIC CARD: ACADEMIC SPACES (No Link) --- */}
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

        {/* --- FOOTER --- */}
        <footer className="border-t border-white/10 bg-black/60 backdrop-blur-xl pt-8 pb-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
              
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[#f15a22] tracking-widest uppercase mb-1">
                  Do You Need Any Support?
                </h4>
                <a href="https://support.sliit.lk" target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-white hover:text-[#f15a22] transition-colors">
                  support.sliit.lk
                </a>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span className="font-mono text-lg">+94 11 754 4801</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-6">
                  <SocialLink href="#" icon={<FacebookIcon />} />
                  <SocialLink href="#" icon={<TwitterIcon />} />
                  <SocialLink href="#" icon={<InstagramIcon />} />
                  <SocialLink href="#" icon={<LinkedinIcon />} />
                </div>
                <div className="text-gray-500 text-sm">
                  © 2026 SLIIT Smart Systems. All rights reserved.
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[200px] backdrop-blur-md shadow-2xl">
                <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-2">
                  <span className="text-3xl font-bold text-[#f15a22]">{today.getDate()}</span>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-[#f15a22] font-bold uppercase">{dayName}</span>
                    <span className="text-[10px] text-gray-400">{fullDate}</span>
                  </div>
                </div>
                <div className="flex justify-between gap-1">
                  {weekDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold 
                        ${index === currentDayIndex 
                          ? 'bg-[#f15a22] text-white shadow-lg scale-110' 
                          : 'bg-white/5 text-gray-500'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="group relative p-6 h-full rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 backdrop-blur-sm flex flex-col items-center text-center">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 rounded-2xl bg-gradient-to-br ${color} transition-opacity duration-500`}></div>
    <div className="relative z-10">
      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const SocialLink = ({ href, icon }) => (
  <a href={href} className="text-gray-400 hover:text-white transition-colors duration-200 transform hover:scale-110 hover:shadow-glow">
    {icon}
  </a>
);

// --- ICONS ---
const FacebookIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>);
const TwitterIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>);
const InstagramIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>);
const LinkedinIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>);

export default Home;