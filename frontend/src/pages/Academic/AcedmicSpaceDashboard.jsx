import React from 'react';
import { Link } from 'react-router-dom';

const AcademicSpaces = () => {
  return (
    <div className="min-h-screen bg-white pb-16">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">Learning & Research</span>
              <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
                 Academic{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Spaces</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Library & Study Area Management</p>
            </div>
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Home
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <StatCard label="Study Rooms Available" value="08" color="text-emerald-400" />
            <StatCard label="Library Occupancy" value="45%" color="text-cyan-400" />
            <StatCard label="Quiet Zone Seats" value="12" color="text-accent" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold mb-3">Campus Resources</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Discussion Rooms */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-xl hover:border-indigo-500/40 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl"></div>
              <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">Discussion Rooms</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Book a private room for group studies or project discussions. Maximum 6 students per room.
            </p>
            <button className="w-full py-3 rounded-xl bg-accent text-white font-bold text-sm shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:opacity-90 transition-opacity">
              Reserve a Room
            </button>
          </div>

          {/* Digital Catalog */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-xl hover:border-cyan-500/40 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl"></div>
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Digital Catalog</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Search for physical books, e-books, and past papers. Reserve books for pickup.
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Title, Author or ISBN..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </div>

          {/* Quiet Zone full width */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl shrink-0"></div>
                <div>
                  <h2 className="text-xl font-bold text-white">Quiet Study Zone</h2>
                  <p className="text-slate-400 text-sm mt-1">Level 3, West Wing  Strictly no talking.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center bg-slate-800 border border-slate-700 px-5 py-3 rounded-xl">
                  <span className="block text-lg font-bold text-emerald-400">Open</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
                </div>
                <button className="px-6 py-3 rounded-xl border border-accent text-accent hover:bg-accent hover:text-white font-bold text-sm transition-all">
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

const StatCard = ({ label, value, color }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

export default AcademicSpaces;
