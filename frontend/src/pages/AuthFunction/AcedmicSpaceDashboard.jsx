import React from 'react';
import { Link } from 'react-router-dom';

const AcademicSpaces = () => {
  return (
    <div 
      className="min-h-screen flex flex-col text-white relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')", // Library Image
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#00152e]/80 backdrop-blur-sm"></div>

      <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* --- Header / Navigation --- */}
        <div className="flex justify-between items-center mb-10">
          <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-[#f15a22] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="font-semibold tracking-wide">Back to Home</span>
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-bold">Academic Spaces</h1>
            <p className="text-sm text-gray-400">Library & Study Area Management</p>
          </div>
        </div>

        {/* --- Stats Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Study Rooms Available" value="08" color="text-green-400" />
          <StatCard label="Library Occupancy" value="45%" color="text-blue-400" />
          <StatCard label="Quiet Zone Seats" value="12" color="text-[#f15a22]" />
        </div>

        {/* --- Main Action Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Study Room Booking */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-[#f15a22]/50 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">🗝️</span>
              <h2 className="text-2xl font-bold group-hover:text-[#f15a22] transition-colors">Discussion Rooms</h2>
            </div>
            <p className="text-gray-300 mb-6">Book a private room for group studies or project discussions. Maximum 6 students per room.</p>
            <button className="w-full py-3 rounded-lg bg-[#002c5f] hover:bg-[#003e85] text-white font-semibold transition-colors shadow-lg">
              Reserve a Room
            </button>
          </div>

          {/* Card 2: Digital Catalog */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-green-400/50 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">💻</span>
              <h2 className="text-2xl font-bold group-hover:text-green-400 transition-colors">Digital Catalog</h2>
            </div>
            <p className="text-gray-300 mb-6">Search for physical books, e-books, and past papers. Reserve books for pickup.</p>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by Title, Author or ISBN..." 
                className="w-full bg-black/40 border border-white/20 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-green-400"
              />
              <button className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </div>

          {/* Card 3: Quiet Zone Check-in */}
          <div className="md:col-span-2 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">🤫 Quiet Study Zone</h2>
                  <p className="text-gray-300">Level 3, West Wing. Strictly no talking.</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center bg-black/30 p-3 rounded-lg min-w-[100px]">
                    <span className="block text-2xl font-bold text-green-400">Open</span>
                    <span className="text-xs text-gray-400 uppercase">Status</span>
                  </div>
                  <button className="px-6 py-3 rounded-lg border border-[#f15a22] text-[#f15a22] hover:bg-[#f15a22] hover:text-white font-semibold transition-all">
                    Check-in Now
                  </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Simple Stat Component
const StatCard = ({ label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border-l-4 border-white/20">
    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{label}</h3>
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AcademicSpaces;